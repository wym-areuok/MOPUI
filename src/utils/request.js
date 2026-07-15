import axios from 'axios'
import i18n from '@/lang'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/mop'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance
// 是否显示重新登录
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 30000
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交（前端辅助机制，后端 @RepeatSubmit 拦截器为真正防护）
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  // 间隔时间(ms)，小于此时间视为重复提交
  const interval = (config.headers || {}).interval || 1000
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + i18n.global.t('request.sizeLimitExceeded'))
      return config
    }
    const cacheKey = 'repeatSubmit_' + config.url
    const sessionObj = cache.session.getJSON(cacheKey)
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON(cacheKey, requestObj)
    } else {
      const s_data = sessionObj.data              // 请求数据
      const s_time = sessionObj.time              // 请求时间
      if (s_data === requestObj.data && requestObj.time - s_time < interval) {
        const message = i18n.global.t('request.repeatSubmit')
        console.warn(`[${config.url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON(cacheKey, requestObj)
      }
    }
  }
  return config
}, error => {
    if (import.meta.env.DEV) {
      console.error('[Request Error]', error)
    }
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息：后端 msg 已通过 MessageUtils.message() 做了 i18n，优先使用
    // errorCode 映射作为兜底（后端未返回 msg 时使用）
    const msg = res.data.msg
      || (errorCode[code] ? i18n.global.t(errorCode[code]) : null)
      || i18n.global.t(errorCode['default'])
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        ElMessageBox.confirm(
          i18n.global.t('request.sessionExpired'),
          i18n.global.t('page.系统提示'),
          {
            confirmButtonText: i18n.global.t('request.relogin'),
            cancelButtonText: i18n.global.t('common.cancel'),
            type: 'warning'
          }
        ).then(() => {
          isRelogin.show = false
          useUserStore().logOut().then(() => {
            location.href = '/index'
          })
      }).catch(() => {
        isRelogin.show = false
      })
      }
      return Promise.reject(new Error(i18n.global.t('request.invalidSession')))
    } else if (code === 500) {
      ElMessage({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: i18n.global.t('common.errorTip'), message: msg })
      return Promise.reject(new Error(msg))
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    if (import.meta.env.DEV) {
      console.error('[Response Error]', error)
    }
    let { message } = error
    if (message == "Network Error") {
      message = i18n.global.t('request.networkError')
    } else if (message.includes("timeout")) {
      message = i18n.global.t('request.timeout')
    } else if (message.includes("Request failed with status code")) {
      message = i18n.global.t('request.apiError')
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: i18n.global.t('common.downloading'), background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data)
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text()
      const rspObj = JSON.parse(resText)
      const errMsg = rspObj.msg
        || (errorCode[rspObj.code] ? i18n.global.t(errorCode[rspObj.code]) : null)
        || i18n.global.t(errorCode['default'])
      ElMessage.error(errMsg)
    }
    downloadLoadingInstance.close()
  }).catch((r) => {
    if (import.meta.env.DEV) {
      console.error(r)
    }
    ElMessage.error(i18n.global.t('common.downloadError'))
    downloadLoadingInstance.close()
  })
}

export default service

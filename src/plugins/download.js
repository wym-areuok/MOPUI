import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import i18n from '@/lang'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { blobValidate } from '@/utils/mop'

const baseURL = import.meta.env.VITE_APP_BASE_API
let downloadLoadingInstance

export default {
  name(name, isDelete = true) {
    var url = baseURL + "/common/download?fileName=" + encodeURIComponent(name) + "&delete=" + isDelete
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data)
      if (isBlob) {
        const blob = new Blob([res.data])
        this.saveAs(blob, decodeURIComponent(res.headers['download-filename']))
      } else {
        this.printErrMsg(res.data)
      }
    }).catch(() => {
      ElMessage.error(i18n.global.t('common.downloadError'))
    })
  },
  resource(resource) {
    var url = baseURL + "/common/download/resource?resource=" + encodeURIComponent(resource)
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data)
      if (isBlob) {
        const blob = new Blob([res.data])
        this.saveAs(blob, decodeURIComponent(res.headers['download-filename']))
      } else {
        this.printErrMsg(res.data)
      }
    }).catch(() => {
      ElMessage.error(i18n.global.t('common.downloadError'))
    })
  },
  zip(url, name) {
    var url = baseURL + url
    downloadLoadingInstance = ElLoading.service({ text: i18n.global.t('common.downloading'), background: "rgba(0, 0, 0, 0.7)", })
    axios({
      method: 'get',
      url: url,
      responseType: 'blob',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    }).then((res) => {
      const isBlob = blobValidate(res.data)
      if (isBlob) {
        const blob = new Blob([res.data], { type: 'application/zip' })
        this.saveAs(blob, name)
      } else {
        this.printErrMsg(res.data)
      }
      downloadLoadingInstance.close()
    }).catch((r) => {
      if (import.meta.env.DEV) {
        console.error(r)
      }
      ElMessage.error(i18n.global.t('common.downloadError'))
      downloadLoadingInstance.close()
    })
  },
  saveAs(text, name, opts) {
    saveAs(text, name, opts)
  },
  async printErrMsg(data) {
    const resText = await data.text()
    const rspObj = JSON.parse(resText)
    const errMsg = (errorCode[rspObj.code] ? i18n.global.t(errorCode[rspObj.code]) : null)
      || i18n.global.t(errorCode['default'])
      || rspObj.msg
    ElMessage.error(errMsg)
  }
}


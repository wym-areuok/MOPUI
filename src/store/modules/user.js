import cache from '@/plugins/cache'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from "@/utils/validate"
import useLockStore from '@/store/modules/lock'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      nickName: '',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        return login(username, password, code, uuid).then(res => {
          setToken(res.token)
          this.token = res.token
          useLockStore().isLock && useLockStore().unlockScreen()
        })
      },
      // 获取用户信息（纯数据操作，不处理 UI 弹窗）
      getInfo() {
        return getInfo().then(res => {
          const user = res.user
          let avatar = user.avatar || ""
          if (!isHttp(avatar)) {
            avatar = (isEmpty(avatar)) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
          }
          if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            this.roles = res.roles
            this.permissions = res.permissions
          } else {
            this.roles = []
            this.permissions = []
          }
          this.id = user.userId
          this.name = user.userName
          this.nickName = user.nickName
          this.avatar = avatar
          cache.session.set('pwdChrtype', res.pwdChrtype)
          return res
        })
      },
      // 退出系统
      logOut() {
        return logout().then(() => {
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
        }).catch(() => {
          // 即使后端登出失败，前端也要清空状态
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
        })
      }
    }
  })

export default useUserStore

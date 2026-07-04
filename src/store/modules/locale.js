import Cookies from 'js-cookie'

const useLocaleStore = defineStore(
  'locale',
  {
    state: () => ({
      currentLocale: Cookies.get('language') || 'zh-CN',
      localeOptions: [
        { value: 'zh-CN', label: '中文' },
        { value: 'en-US', label: 'English' },
      ]
    }),
    getters: {
      isZhCN(state) {
        return state.currentLocale === 'zh-CN'
      }
    },
    actions: {
      setLocale(lang) {
        this.currentLocale = lang
        Cookies.set('language', lang)
      }
    }
  })

export default useLocaleStore

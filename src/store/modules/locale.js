import Cookies from 'js-cookie'

/**
 * 语言切换策略：
 * 均采用 BCP 47 国际标准格式 (zh-CN / en-US)
 * - vue-i18n：直接使用，无需转换
 * - Spring 后端：I18nConfig 已配置 setLanguageTagCompliant(true)，原生支持 BCP 47
 * - Cookie 存储：标准格式，前后端通用，无需任何转换
 */
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
        Cookies.set('language', lang)  // BCP 47 标准格式，前后端通用
      }
    }
  })

export default useLocaleStore

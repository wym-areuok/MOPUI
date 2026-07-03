import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import zhCNLocale from 'element-plus/es/locale/lang/zh-cn'
import enUSLocale from 'element-plus/es/locale/lang/en'

import zhCN from './zh-CN'
import enUS from './en-US'

// 获取浏览器语言或 Cookie 中保存的语言设置
function getLanguage() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // 如果没有设置，使用浏览器语言
  const language = navigator.language || navigator.userLanguage
  const locales = ['zh-CN', 'en-US']
  if (locales.includes(language)) {
    return language
  }
  return 'zh-CN'
}

const messages = {
  'zh-CN': {
    ...zhCN,
    ...zhCNLocale, // 合并 Element Plus 中文语言包
  },
  'en-US': {
    ...enUS,
    ...enUSLocale, // 合并 Element Plus 英文语言包
  },
}

// 导出 Element Plus 语言包映射，供 main.js 使用
export const elementLocaleMap = {
  'zh-CN': zhCNLocale,
  'en-US': enUSLocale,
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getLanguage(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true, // 全局注入 $t 方法
})

export default i18n

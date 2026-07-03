import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Cookies from 'js-cookie'

export const useLocaleStore = defineStore('locale', () => {
  const { locale } = useI18n()

  const currentLocale = ref(Cookies.get('language') || 'zh-CN')

  const localeOptions = ref([
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' },
  ])

  const isZhCN = computed(() => currentLocale.value === 'zh-CN')

  function setLocale(lang) {
    currentLocale.value = lang
    locale.value = lang
    Cookies.set('language', lang)
  }

  return {
    currentLocale,
    localeOptions,
    isZhCN,
    setLocale,
  }
})

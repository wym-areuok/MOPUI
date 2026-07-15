/**
 * 密码强度规则
 * 根据参数 chrtype 动态生成校验规则
 *
 * chrtype 说明：
 *   0 - 任意字符（默认）
 *   1 - 纯数字（0-9）
 *   2 - 纯字母（a-z / A-Z）
 *   3 - 字母 + 数字（必须同时包含）
 *   4 - 字母 + 数字 + 特殊字符（必须同时包含，特殊字符：~!@#$%^&*()-=_+）
 */

import cache from '@/plugins/cache'
import i18n from '@/lang'

// 密码限制类型
const pwdChrType = ref(cache.session.get('pwdChrtype') || '0')

// 各类型对应的正则和 i18n key
const PWD_RULES = {
  '0': { pattern: /^[^<>"'|\\]+$/, key: 'password.noIllegalChar' },
  '1': { pattern: /^[0-9]+$/, key: 'password.digitOnly' },
  '2': { pattern: /^[a-zA-Z]+$/, key: 'password.letterOnly' },
  '3': { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, key: 'password.letterAndDigit' },
  '4': { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()\-=_+])[A-Za-z\d~!@#$%^&*()\-=_+]+$/, key: 'password.letterDigitSpecial' }
}

export function usePasswordRule() {
  // 默认密码校验
  const pwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: i18n.global.t('password.notEmpty'), trigger: 'blur' },
      { min: 6, max: 20, message: i18n.global.t('password.lengthBetween6And20'), trigger: 'blur' },
      { pattern: rule.pattern, message: i18n.global.t(rule.key), trigger: 'blur' }
    ]
  })
  // 校验prompt的inputValidator函数
  const pwdPromptValidator = (value) => {
    const rule = PWD_RULES['0']
    if (!value || value.length < 6 || value.length > 20) {
      return i18n.global.t('password.lengthBetween6And20')
    }
    if (!rule.pattern.test(value)) {
      return i18n.global.t(rule.key)
    }
  }
  // 个人中心密码校验
  const infoPwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: i18n.global.t('password.newNotEmpty'), trigger: 'blur' },
      { min: 6, max: 20, message: i18n.global.t('password.lengthBetween6And20'), trigger: 'blur' },
      { pattern: rule.pattern, message: i18n.global.t(rule.key), trigger: 'blur' }
    ]
  })
  // 注册页面密码校验
  const registerPwdValidator = computed(() => {
    const rule = PWD_RULES['0']
    return [
      { required: true, message: i18n.global.t('password.enterYourPassword'), trigger: 'blur' },
      { min: 6, max: 20, message: i18n.global.t('password.userPwdLength'), trigger: 'blur' },
      { pattern: rule.pattern, message: i18n.global.t(rule.key), trigger: 'blur' }
    ]
  })

  return {
    pwdChrType,
    pwdValidator,
    infoPwdValidator,
    pwdPromptValidator,
    registerPwdValidator
  }
}

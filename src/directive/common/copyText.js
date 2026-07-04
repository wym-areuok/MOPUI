/**
* v-copyText 复制文本内容
* Copyright (c) 2022 ruoyi
*/
export default {
  beforeMount(el, { value, arg }) {
    if (arg === "callback") {
      el.$copyCallback = value
    } else {
      el.$copyValue = value
      const handler = () => {
        copyTextToClipboard(el.$copyValue)
        if (el.$copyCallback) {
          el.$copyCallback(el.$copyValue)
        }
      }
      el.addEventListener("click", handler)
      el.$destroyCopy = () => el.removeEventListener("click", handler)
    }
  }
}

async function copyTextToClipboard(input) {
  const previouslyFocusedElement = document.activeElement

  try {
    // 优先使用现代 Clipboard API
    await navigator.clipboard.writeText(input)
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus()
    }
    return true
  } catch {
    // 降级方案：使用 textarea + execCommand（兼容旧浏览器和非 HTTPS 环境）
    return fallbackCopy(input, previouslyFocusedElement)
  }
}

function fallbackCopy(input, previouslyFocusedElement) {
  const element = document.createElement('textarea')
  element.value = input
  element.setAttribute('readonly', '')
  element.style.contain = 'strict'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.fontSize = '12pt'

  const selection = document.getSelection()
  const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0)

  document.body.append(element)
  element.select()
  element.selectionStart = 0
  element.selectionEnd = input.length

  let isSuccess = false
  try {
    isSuccess = document.execCommand('copy')
  } catch { }

  element.remove()

  if (originalRange) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus()
  }

  return isSuccess
}

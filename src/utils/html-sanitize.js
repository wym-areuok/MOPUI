/**
 * HTML XSS 过滤工具
 *
 * 统一使用 DOMPurify 进行 HTML 安全检查，遵循白名单策略：
 * - 默认仅允许安全的格式化标签（b/i/em/strong/a/p/br/ul/ol/li/h1-h6/table 等）
 * - 禁止所有事件处理器（on*）、危险标签（script/iframe/object/embed）和危险协议（javascript:/data:）
 * - 禁止自定义属性、禁止未知标签
 *
 * 使用方式：
 *   import { sanitizeHtml } from '@/utils/html-sanitize'
 *   const safe = sanitizeHtml(unsafeContent)
 *
 * 依赖：需安装 dompurify（npm install dompurify）
 */

// 延迟引用，避免构建时模块未安装
let DOMPurify = null

function getDOMPurify() {
  if (DOMPurify) return DOMPurify
  try {
    // 动态 import 兜底：若静态 import 失败，构建不会中断
    DOMPurify = require('dompurify').default || require('dompurify')
  } catch {
    // 回退：若生产环境未安装 dompurify，使用保守的纯字符串方案
    console.warn('[Security] DOMPurify 未安装，将使用字符串转义作为回退。请安装: npm install dompurify')
  }
  return DOMPurify
}

/**
 * 回退清理方案：完整的 HTML 转义（只生成纯文本，完全不保留 HTML 标签）
 * 当 DOMPurify 不可用时启用，确保安全优先
 */
function fallbackEscape(html) {
  if (!html) return ''
  const div = document.createElement('div')
  div.textContent = String(html)
  return div.innerHTML // 使用浏览器内置转义，确保所有特殊字符安全
}

/**
 * 使用 DOMPurify 过滤 HTML 内容
 * @param {string} html 原始 HTML 字符串
 * @param {object} [options] DOMPurify 配置选项，默认白名单仅允许安全的格式化标签
 * @returns {string} 安全的 HTML 字符串
 */
export function sanitizeHtml(html, options) {
  if (!html) return ''
  const dp = getDOMPurify()
  if (!dp) return fallbackEscape(html)

  const defaultOptions = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'sub', 'sup',
      'a', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'pre', 'code', 'blockquote',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
      'abbr', 'cite', 'del', 'ins', 'mark', 'small'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel', 'width', 'height', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta', 'style'],
    FORBID_ATTR: [],
    KEEP_CONTENT: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
  }

  return dp.sanitize(String(html), options || defaultOptions)
}

/**
 * 简化版：仅保留纯文本渲染的安全 HTML（用于富文本公告等场景，需要保留基础格式）
 * 实际使用 DOMPurify 白名单，与 sanitizeHtml 等效
 */
export default sanitizeHtml

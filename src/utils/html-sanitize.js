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
 */

import DOMPurify from 'dompurify'

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

/**
 * 使用 DOMPurify 过滤 HTML 内容
 * @param {string} html 原始 HTML 字符串
 * @param {object} [options] DOMPurify 配置选项，默认白名单仅允许安全的格式化标签
 * @returns {string} 安全的 HTML 字符串
 */
export function sanitizeHtml(html, options) {
  if (!html) return ''
  return DOMPurify.sanitize(String(html), options || defaultOptions)
}

export default sanitizeHtml

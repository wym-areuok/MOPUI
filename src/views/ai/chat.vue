<template>
  <div class="ai-chat-wrapper">

    <!-- ========== 左侧会话栏 ========== -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <el-button
          class="btn-new-chat"
          :loading="creatingConv"
          :disabled="isStreaming"
          @click="handleNewConversation"
        >
          <el-icon v-if="!creatingConv"><EditPen /></el-icon>
          {{ $t('page.新对话') }}
        </el-button>
      </div>

      <div
        v-loading="loadingConvs"
        :element-loading-text="$t('common.loading')"
        class="conv-list"
      >
        <div v-if="!loadingConvs && conversations.length === 0" class="conv-empty">
          {{ $t('common.noData') }}
        </div>

        <TransitionGroup name="conv-fade" tag="div">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="conv-item"
            :class="{ active: currentConvId === conv.id }"
            @click="handleSelectConversation(conv.id)"
          >
            <el-icon class="conv-icon"><ChatDotRound /></el-icon>
            <span class="conv-title">{{ conv.title }}</span>
            <div class="conv-actions" @click.stop>
              <el-tooltip :content="$t('page.重命名会话')" placement="top" :show-after="300">
                <el-button
                  text
                  class="conv-action-btn"
                  @click="openRenameDialog(conv)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.delete')" placement="top" :show-after="300">
                <el-button
                  text
                  class="conv-action-btn danger"
                  @click="handleDeleteConversation(conv.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </aside>

    <!-- ========== 主聊天区 ========== -->
    <main class="chat-main">

      <!-- 欢迎页 -->
      <Transition name="fade">
        <div v-if="!currentConvId" class="welcome-screen">
          <div class="welcome-glow"></div>
          <div class="welcome-avatar">✦</div>
          <h2 class="welcome-title">{{ $t('page.你好，我是 AI 助手') }}</h2>
          <p class="welcome-subtitle">{{ $t('page.选择左侧会话或点击新对话开始') }}</p>
          <div class="welcome-tips">
            <div class="tip-card" @click="handleNewConversation">
              <el-icon><MagicStick /></el-icon>
              <span>{{ $t('page.开始一段对话') }}</span>
            </div>
            <div class="tip-card" @click="handleNewConversation">
              <el-icon><Cpu /></el-icon>
              <span>{{ $t('page.探索 AI 能力') }}</span>
            </div>
            <div class="tip-card" @click="handleNewConversation">
              <el-icon><DocumentChecked /></el-icon>
              <span>{{ $t('page.解决实际问题') }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 消息列表 -->
      <div v-show="currentConvId" class="messages-area" ref="messagesAreaRef">
        <div v-if="loadingMessages" class="messages-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ $t('page.加载消息中') }}</span>
        </div>

        <template v-else>
          <TransitionGroup name="msg-slide" tag="div" class="messages-inner">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="msg-row"
              :class="msg.role"
            >
              <!-- AI 头像 -->
              <div v-if="msg.role === 'assistant'" class="avatar ai-av">✦</div>

              <!-- 气泡 -->
              <div
                class="bubble"
                :class="[`${msg.role}-bubble`, { 'has-error': msg.error }]"
              >
                <!-- AI：loading 三点 -->
                <div v-if="msg.loading" class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <!-- AI：错误状态 -->
                <div v-else-if="msg.error" class="error-msg">
                  <el-icon><Warning /></el-icon>
                  {{ msg.error }}
                </div>
                <!-- AI：正常内容 -->
                <div
                  v-else-if="msg.role === 'assistant'"
                  class="markdown-body"
                  :class="{ 'typing-cursor': msg.streaming }"
                  v-html="renderMarkdown(msg.content)"
                ></div>
                <!-- 用户：纯文本 -->
                <span v-else class="user-text">{{ msg.content }}</span>
              </div>

              <!-- 用户头像 -->
              <div v-if="msg.role === 'user'" class="avatar user-av">{{ $t('page.我') }}</div>
            </div>
          </TransitionGroup>
        </template>
      </div>

      <!-- 输入区域 -->
      <div v-show="currentConvId" class="input-area">
        <div class="input-box" :class="{ focused: inputFocused }">
          <el-input
            v-model="inputText"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            :placeholder="$t('page.输入消息提示')"
            resize="none"
            :disabled="isStreaming"
            @keydown="handleKeyDown"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            ref="inputRef"
          />
          <el-button
            class="btn-send"
            :disabled="isStreaming || !inputText.trim()"
            @click="handleSendMessage"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </el-button>
        </div>
        <p class="input-hint">{{ $t('page.AI 生成内容仅供参考，请注意甄别') }}</p>
      </div>
    </main>

    <!-- ========== 重命名弹窗 ========== -->
    <el-dialog
      v-model="renameDialogVisible"
      :title="$t('page.重命名会话')"
      width="400px"
      :close-on-click-modal="false"
      draggable
      @opened="renameInputRef?.focus()"
    >
      <el-input
        ref="renameInputRef"
        v-model="renameTitle"
        maxlength="50"
        show-word-limit
        :placeholder="$t('page.请输入新名称')"
        @keyup.enter="submitRename"
      />
      <template #footer>
        <el-button @click="renameDialogVisible = false">{{ $t('page.取 消') }}</el-button>
        <el-button
          type="primary"
          :disabled="!renameTitle.trim()"
          @click="submitRename"
        >{{ $t('page.确 定') }}</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  EditPen, ChatDotRound, Edit, Delete, Loading,
  Warning, MagicStick, Cpu, DocumentChecked
} from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import {
  listConversations,
  createConversation,
  renameConversation,
  deleteConversation,
  listMessages
} from '@/api/ai/chat'

const { t } = useI18n()

// ──────────────────────────────────────────
// 响应式状态
// ──────────────────────────────────────────
const conversations    = ref([])
const loadingConvs     = ref(false)
const creatingConv     = ref(false)
const currentConvId    = ref(null)
const messages         = ref([])
const loadingMessages  = ref(false)
const inputText        = ref('')
const inputFocused     = ref(false)
const isStreaming      = ref(false)
const renameDialogVisible = ref(false)
const renameTitle      = ref('')
const renameTargetId   = ref(null)

// SSE 相关
let currentReader      = null
let sseEventBuffer     = null   // 暂存 event: 行

// DOM refs
const messagesAreaRef  = ref(null)
const inputRef         = ref(null)
const renameInputRef   = ref(null)

// ──────────────────────────────────────────
// 生命周期
// ──────────────────────────────────────────
onMounted(() => loadConvList(true))
onBeforeUnmount(() => abortStream())

// ──────────────────────────────────────────
// 会话管理
// ──────────────────────────────────────────
async function loadConvList(autoSelect = false) {
  loadingConvs.value = true
  try {
    const res = await listConversations()
    if (res.code === 200) {
      conversations.value = res.data || []
      if (autoSelect && conversations.value.length > 0 && !currentConvId.value) {
        await selectConversation(conversations.value[0].id)
      }
    }
  } catch {
    ElMessage.error(t('page.加载会话列表失败'))
  } finally {
    loadingConvs.value = false
  }
}

async function handleNewConversation() {
  if (isStreaming.value) return
  creatingConv.value = true
  try {
    const res = await createConversation()
    if (res.code === 200) {
      currentConvId.value = res.data.id
      messages.value = []
      await loadConvList()
      nextTick(() => focusInput())
    } else {
      ElMessage.error(t('page.新建失败：') + (res.msg || res.code))
    }
  } catch {
    ElMessage.error(t('page.新建失败，请重试'))
  } finally {
    creatingConv.value = false
  }
}

async function handleSelectConversation(id) {
  if (isStreaming.value || id === currentConvId.value) return
  await selectConversation(id)
}

async function selectConversation(id) {
  currentConvId.value = id
  await loadMessageList(id)
}

async function loadMessageList(convId) {
  loadingMessages.value = true
  messages.value = []
  try {
    const res = await listMessages(convId)
    if (res.code === 200) {
      messages.value = (res.data || []).map(m => ({
        role: m.role,
        content: m.content,
        loading: false,
        streaming: false,
        error: null
      }))
      nextTick(() => { scrollToBottom(); focusInput() })
    }
  } catch {
    ElMessage.error(t('page.加载消息失败'))
  } finally {
    loadingMessages.value = false
  }
}

function openRenameDialog(conv) {
  renameTargetId.value = conv.id
  renameTitle.value = conv.title
  renameDialogVisible.value = true
}

async function submitRename() {
  const title = renameTitle.value.trim()
  if (!title) return
  try {
    const res = await renameConversation(renameTargetId.value, title)
    if (res.code === 200) {
      renameDialogVisible.value = false
      await loadConvList()
      ElMessage.success(t('page.重命名成功'))
    } else {
      ElMessage.error(t('page.重命名失败：') + (res.msg || res.code))
    }
  } catch {
    ElMessage.error(t('page.重命名失败，请重试'))
  }
}

async function handleDeleteConversation(id) {
  try {
    await ElMessageBox.confirm(t('page.确认删除该对话及所有消息？'), t('page.系统提示'), {
      confirmButtonText: t('page.确定'),
      cancelButtonText: t('page.取消'),
      type: 'warning'
    })
  } catch {
    return  // 用户取消
  }
  try {
    const res = await deleteConversation(id)
    if (res.code === 200) {
      if (currentConvId.value === id) {
        currentConvId.value = null
        messages.value = []
      }
      await loadConvList()
      ElMessage.success(t('page.删除成功'))
    } else {
      ElMessage.error(t('page.删除失败：') + (res.msg || res.code))
    }
  } catch {
    ElMessage.error(t('page.删除失败，请重试'))
  }
}

// ──────────────────────────────────────────
// 发送消息 —— Fetch SSE（携带 JWT）
// ──────────────────────────────────────────
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    handleSendMessage()
  }
}

async function handleSendMessage() {
  if (isStreaming.value || !currentConvId.value) return
  const text = inputText.value.trim()
  if (!text) return

  inputText.value = ''
  isStreaming.value = true

  // 追加用户气泡
  messages.value.push({ role: 'user', content: text, loading: false, streaming: false, error: null })

  // 追加 AI loading 占位
  const aiIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '', loading: true, streaming: false, error: null })
  nextTick(() => scrollToBottom())

  const baseUrl = import.meta.env.VITE_APP_BASE_API || ''
  const url = `${baseUrl}/ai/chat/stream?conversationId=${currentConvId.value}&message=${encodeURIComponent(text)}`
  const token = getToken()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body.getReader()
    currentReader = reader
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    sseEventBuffer = null

    // loading → streaming
    messages.value[aiIndex] = { ...messages.value[aiIndex], loading: false, streaming: true }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()   // 末尾可能是不完整行，留到下轮

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) { sseEventBuffer = null; continue }

        if (trimmed.startsWith('event:')) {
          sseEventBuffer = trimmed.slice(6).trim()
        } else if (trimmed.startsWith('data:')) {
          const data  = trimmed.slice(5).trim()
          const event = sseEventBuffer || 'message'
          sseEventBuffer = null

          if (event === 'message') {
            const cur = messages.value[aiIndex]
            messages.value[aiIndex] = { ...cur, content: cur.content + data }
            nextTick(() => scrollToBottom())

          } else if (event === 'done') {
            messages.value[aiIndex] = { ...messages.value[aiIndex], streaming: false }
            isStreaming.value = false
            currentReader = null
            loadConvList()   // 刷新侧栏标题
            return

          } else if (event === 'error') {
            throw new Error(data || 'AI 服务异常')
          }
        }
      }
    }

  } catch (e) {
    if (e.name === 'AbortError') return
    const errMsg = e.message || '服务异常，请重试'
    messages.value[aiIndex] = {
      role: 'assistant', content: '', loading: false, streaming: false, error: errMsg
    }
    ElMessage.error(t('page.AI 响应失败：') + errMsg)
  } finally {
    isStreaming.value = false
    currentReader = null
    nextTick(() => focusInput())
  }
}

function abortStream() {
  if (currentReader) {
    try { currentReader.cancel() } catch (_) {}
    currentReader = null
  }
  isStreaming.value = false
}

// ──────────────────────────────────────────
// Markdown 轻量渲染
// ──────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderMarkdown(text) {
  if (!text) return ''
  let html = escapeHtml(text)
  // 代码块
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    '<pre class="code-block"><code>$1</code></pre>'
  )
  // 行内代码
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // 斜体
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  // 无序列表
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, m => `<ul>${m}</ul>`)
  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  // 水平线
  html = html.replace(/^---+$/gm, '<hr>')
  // 换行
  html = html.replace(/\n/g, '<br>')
  return html
}

// ──────────────────────────────────────────
// 工具
// ──────────────────────────────────────────
function scrollToBottom() {
  const el = messagesAreaRef.value
  if (el) el.scrollTop = el.scrollHeight
}

function focusInput() {
  const textarea = inputRef.value?.$el?.querySelector('textarea')
  textarea?.focus()
}
</script>

<style scoped>
/* ===== 整体布局 ===== */
.ai-chat-wrapper {
  display: flex;
  /* 顶部 navbar 50px + tabs-nav 34px + 内边距 */
  height: calc(100vh - 84px);
  background: #f5f7fa;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
               'Microsoft YaHei', sans-serif;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 226px;
  min-width: 226px;
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 14px 12px 10px;
  border-bottom: 1px solid #f2f4f7;
}

.btn-new-chat {
  width: 100% !important;
  background: #f0f7ff !important;
  border: 1.5px dashed #409eff !important;
  color: #409eff !important;
  border-radius: 9px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  gap: 6px !important;
  height: 38px !important;
  transition: all 0.2s !important;
}
.btn-new-chat:hover:not(:disabled) {
  background: #d9ecff !important;
  border-color: #66b1ff !important;
}

.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 8px 8px;
  min-height: 0;
}

.conv-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 28px 0;
}

/* 会话条目 */
.conv-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: background 0.15s;
  user-select: none;
  gap: 7px;
  margin-bottom: 2px;
  position: relative;
}
.conv-item:hover { background: #f5f7fa; }
.conv-item.active {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.conv-icon {
  font-size: 13px;
  flex-shrink: 0;
  opacity: 0.6;
}

.conv-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.conv-actions {
  display: none;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}
.conv-item:hover .conv-actions,
.conv-item.active .conv-actions {
  display: flex;
}

.conv-action-btn {
  padding: 3px 4px !important;
  height: auto !important;
  color: #909399 !important;
  font-size: 13px !important;
}
.conv-action-btn:hover { color: #409eff !important; }
.conv-action-btn.danger:hover { color: #f56c6c !important; }

/* 侧栏列表过渡 */
.conv-fade-enter-active,
.conv-fade-leave-active { transition: all 0.2s; }
.conv-fade-enter-from  { opacity: 0; transform: translateX(-8px); }
.conv-fade-leave-to    { opacity: 0; transform: translateX(-8px); }

/* ===== 主聊天区 ===== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f7fa;
  position: relative;
}

/* 欢迎页 */
.welcome-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1;
}

.welcome-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.welcome-avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c3be4 0%, #409eff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.25);
  margin-bottom: 6px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.3px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.welcome-tips {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.tip-card:hover {
  border-color: #409eff;
  color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

/* 欢迎页过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ===== 消息列表 ===== */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0 10px;
  min-height: 0;
}

.messages-inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.messages-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  padding: 48px 0;
}

/* 消息行过渡 */
.msg-slide-enter-active { transition: all 0.22s ease; }
.msg-slide-enter-from   { opacity: 0; transform: translateY(10px); }

/* 消息行 */
.msg-row {
  display: flex;
  align-items: flex-start;
  padding: 5px 44px;
  gap: 12px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.msg-row.user { flex-direction: row-reverse; }

/* 头像 */
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.user-av {
  background: #409eff;
  color: #fff;
  font-size: 12px;
}
.ai-av {
  background: linear-gradient(135deg, #6c3be4 0%, #409eff 100%);
  color: #fff;
  font-size: 16px;
}

/* 气泡 */
.bubble {
  max-width: 70%;
  padding: 11px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
}
.user-bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.assistant-bubble {
  background: #fff;
  color: #303133;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}
.has-error {
  background: #fff5f5;
  border: 1px solid #fde2e2;
}

/* 打字光标 */
.typing-cursor::after {
  content: '▋';
  font-size: 12px;
  animation: blink 0.8s step-start infinite;
  margin-left: 2px;
  color: #409eff;
  vertical-align: baseline;
}
@keyframes blink { 50% { opacity: 0; } }

/* 三点加载 */
.loading-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
}
.loading-dots span {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: #c0c4cc;
  border-radius: 50%;
  animation: dotBounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.18s; }
.loading-dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes dotBounce {
  0%, 60%, 100% { transform: translateY(0);    }
  30%           { transform: translateY(-7px); }
}

/* 错误提示 */
.error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56c6c;
  font-size: 13px;
}

/* Markdown 样式 */
.markdown-body :deep(pre.code-block) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 14px 18px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  margin: 8px 0;
  font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
  line-height: 1.65;
}
.markdown-body :deep(code.inline-code) {
  background: #f0f2f5;
  color: #e83e8c;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Fira Code', 'Courier New', monospace;
}
.markdown-body :deep(ul) {
  margin: 6px 0;
  padding-left: 20px;
}
.markdown-body :deep(li) { margin: 3px 0; }
.markdown-body :deep(strong) { font-weight: 600; color: #1a1a2e; }
.markdown-body :deep(em) { font-style: italic; color: #606266; }
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #ebeef5;
  margin: 10px 0;
}

/* ===== 输入区域 ===== */
.input-area {
  padding: 10px 44px 14px;
  background: #f5f7fa;
  flex-shrink: 0;
}

.input-box {
  max-width: 812px;
  margin: 0 auto;
  background: #fff;
  border: 1.5px solid #dcdfe6;
  border-radius: 14px;
  padding: 8px 10px 8px 16px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.input-box.focused {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.08);
}

/* 覆盖 el-input el-textarea 样式 */
.input-box :deep(.el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 5px 0 !important;
  font-size: 14px !important;
  line-height: 1.65 !important;
  color: #303133 !important;
  font-family: inherit !important;
  resize: none !important;
}
.input-box :deep(.el-textarea__inner)::placeholder {
  color: #c0c4cc;
}

.btn-send {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  background: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: background 0.2s, transform 0.12s, box-shadow 0.2s !important;
  margin-bottom: 1px;
}
.btn-send:hover:not(:disabled) {
  background: #66b1ff !important;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.3) !important;
}
.btn-send:active:not(:disabled) { transform: scale(0.91) !important; }
.btn-send:disabled {
  background: #c0c4cc !important;
  border-color: #c0c4cc !important;
  cursor: not-allowed !important;
}

.input-hint {
  max-width: 812px;
  margin: 5px auto 0;
  font-size: 11px;
  color: #c0c4cc;
  text-align: center;
}

/* ===== 滚动条 ===== */
.conv-list::-webkit-scrollbar,
.messages-area::-webkit-scrollbar {
  width: 4px;
}
.conv-list::-webkit-scrollbar-track,
.messages-area::-webkit-scrollbar-track {
  background: transparent;
}
.conv-list::-webkit-scrollbar-thumb,
.messages-area::-webkit-scrollbar-thumb {
  background: #e4e7ed;
  border-radius: 4px;
}
</style>

<template>
  <el-dialog :title="$t('page.操作日志详细')" v-model="dialogVisible" width="780px" append-to-body @close="$emit('update:visible', false)">
    <div class="detail-wrap">
      <!-- 基本信息 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><InfoFilled /></el-icon> {{ $t('page.基本信息') }}</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('page.操作模块') }}</span><span class="detail-value">{{ form.title }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('page.业务类型') }}</span><span class="detail-value">{{ typeLabel }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('page.操作时间') }}</span><span class="detail-value">{{ form.operTime }}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">{{ $t('page.执行状态') }}</span>
              <el-tag v-if="form.status === 0" type="success" size="small">{{ $t('page.正常') }}</el-tag>
              <el-tag v-else type="danger" size="small">{{ $t('page.异常') }}</el-tag>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作人员 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><User /></el-icon> {{ $t('page.操作人员') }}</div>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('page.操作人员') }}</span><span class="detail-value">{{ form.operName }}</span></div>
          </el-col>
          <el-col :span="12" v-if="form.deptName">
            <div class="detail-item"><span class="detail-label">{{ $t('page.所属部门') }}</span><span class="detail-value">{{ form.deptName }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">{{ $t('page.操作地址') }}</span>
              <span class="detail-value">{{ form.operIp }}&nbsp;&nbsp;<span class="detail-location">{{ form.operLocation }}</span></span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 请求信息 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Sort /></el-icon> {{ $t('page.请求信息') }}</div>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">{{ $t('page.请求地址') }}</span>
              <span class="detail-value">
                <span :class="'method-tag method-' + form.requestMethod">{{ form.requestMethod }}</span>
                {{ form.operUrl }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="24">
            <div class="detail-item"><span class="detail-label">{{ $t('page.操作方法') }}</span><span class="detail-value mono">{{ form.method }}</span></div>
          </el-col>
        </el-row>
        <el-row class="detail-row">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">{{ $t('page.消耗时间') }}</span><span class="detail-value">{{ form.costTime }} {{ $t('page.毫秒') }}</span></div>
          </el-col>
        </el-row>
      </div>

      <!-- 请求参数 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Upload /></el-icon> {{ $t('page.请求参数') }}</div>
        <div class="code-body">
          <div class="code-wrap">
            <div class="code-action">
              <el-button size="small" :icon="CopyDocument" @click="copyText(form.operParam)">{{ $t('page.复制') }}</el-button>
            </div>
            <pre class="code-pre">{{ formatJson(form.operParam) }}</pre>
          </div>
        </div>
      </div>

      <!-- 返回参数 -->
      <div class="detail-card">
        <div class="detail-card-title"><el-icon><Download /></el-icon> {{ $t('page.返回参数') }}</div>
        <div class="code-body">
          <div class="code-wrap">
            <div class="code-action">
              <el-button size="small" :icon="CopyDocument" @click="copyText(form.jsonResult)">{{ $t('page.复制') }}</el-button>
            </div>
            <pre class="code-pre">{{ formatJson(form.jsonResult) }}</pre>
          </div>
        </div>
      </div>

      <!-- 异常信息 -->
      <div class="detail-card" v-if="form.status !== 0">
        <div class="detail-card-title error-title"><el-icon><Warning /></el-icon> {{ $t('page.异常信息') }}</div>
        <div class="error-body">
          <div class="error-msg">{{ form.errorMsg }}</div>
        </div>
      </div>

    </div>
  </el-dialog>
</template>

<script setup>
const { proxy } = getCurrentInstance()

const props = defineProps({
  visible: { type: Boolean, default: false },
  row: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

 
const { sys_oper_type } = useDict('sys_oper_type')

const form = computed(() => props.row || {})
const typeLabel = computed(() => selectDictLabel(sys_oper_type.value, form.value.businessType) || '-')

function formatJson(str) {
  if (!str) return proxy.$t('page.（无数据）')
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

function copyText(str) {
  const text = formatJson(str)
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => ElMessage({ message: proxy.$t('page.已复制'), type: 'success', duration: 1500 }))
  } else {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage({ message: proxy.$t('page.已复制'), type: 'success', duration: 1500 })
  }
}
</script>

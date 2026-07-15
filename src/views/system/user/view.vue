<template>
  <el-drawer :title="$t('page.用户信息详情')" v-model="visible" direction="rtl" size="68%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <!-- 基本信息 -->
      <h4 class="section-header">{{ $t('page.基本信息') }}</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.用户名称') }}：</label>
            <span class="info-value plaintext">{{ info.nickName }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.归属部门') }}：</label>
            <span class="info-value plaintext">{{ (info.dept && info.dept.deptName) }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.手机号码标记') }}</label>
            <span class="info-value plaintext">{{ info.phonenumber }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.邮箱') }}：</label>
            <span class="info-value plaintext">{{ info.email }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.登录账号') }}：</label>
            <span class="info-value plaintext">{{ info.userName }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.用户状态') }}：</label>
            <span class="info-value plaintext">
              <el-tag size="small" :type="info.status === '0' ? 'success' : 'danger'">{{ info.status === '0' ? $t('page.正常') : $t('page.停用') }}</el-tag>
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.岗位') }}：</label>
            <span class="info-value plaintext">{{ postNames || $t('page.无岗位') }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.用户性别') }}：</label>
            <span class="info-value plaintext">{{ sexLabel }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item full-width">
            <label class="info-label">{{ $t('page.角色') }}：</label>
            <span class="info-value plaintext">{{ roleNames || $t('page.无角色') }}</span>
          </div>
        </el-col>
      </el-row>
      <!-- 其他信息 -->
      <h4 class="section-header">{{ $t('page.其他信息') }}</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.创建者') }}：</label>
            <span class="info-value plaintext">{{ info.createBy }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.创建时间') }}：</label>
            <span class="info-value plaintext">{{ info.createTime }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.更新者') }}：</label>
            <span class="info-value plaintext">{{ info.updateBy }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.更新时间') }}：</label>
            <span class="info-value plaintext">{{ info.updateTime }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.最后登录IP') }}：</label>
            <span class="info-value plaintext">{{ info.loginIp }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">{{ $t('page.最后登录时间') }}：</label>
            <span class="info-value plaintext">{{ info.loginDate }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="24">
          <div class="info-item full-width">
            <label class="info-label">{{ $t('page.备注') }}：</label>
            <span class="info-value plaintext">{{ info.remark }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup>
import { getUser } from '@/api/system/user'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const visible = ref(false)
const loading = ref(false)
const info = reactive({})
const postOptions = ref([])
const roleOptions = ref([])

const { sys_user_sex } = useDict("sys_user_sex")

const sexLabel = computed(() => selectDictLabel(sys_user_sex.value, info.sex) || '-')

const postNames = computed(() => {
  if (!postOptions.value.length || !info.postIds) return ''
  return postOptions.value.filter(p => info.postIds?.includes(p.postId)).map(p => p.postName).join('、') || ''
})

const roleNames = computed(() => {
  if (!roleOptions.value.length || !info.roleIds) return ''
  return roleOptions.value.filter(r => info.roleIds?.includes(r.roleId)).map(r => r.roleName).join('、') || ''
})

const open = async (userId) => {
  visible.value = true
  loading.value = true
  try {
    const res = await getUser(userId)
    Object.assign(info, res.data || {})
    postOptions.value = res.posts || []
    roleOptions.value = res.roles || []
    info.postIds = res.postIds || []
    info.roleIds = res.roleIds || []
  } catch (error) {
    proxy.$modal.msgError(proxy.$t('page.获取用户信息失败'))
  } finally {
    loading.value = false
  }
}

function handleClose() {
  visible.value = false
}

defineExpose({
  open
})
</script>

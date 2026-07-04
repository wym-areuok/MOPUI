<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item :label="$t('page.旧密码')" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="$t('page.请输入旧密码')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('page.新密码')" prop="newPassword" :rules="infoPwdValidator">
      <el-input v-model="user.newPassword" :placeholder="$t('page.请输入新密码')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('page.确认密码')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" :placeholder="$t('page.请确认新密码')" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="submitting" @click="submit">{{ $t('page.保存') }}</el-button>
      <el-button type="danger" @click="close">{{ $t('page.关闭') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { usePasswordRule } from "@/utils/passwordRule"
import { updateUserPwd } from "@/api/system/user"

const { proxy } = getCurrentInstance()
const { infoPwdValidator } = usePasswordRule()

const submitting = ref(false)
const pwdRef = ref(null)

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const rules = ref({
  oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "确认密码不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      submitting.value = true
      updateUserPwd(user.oldPassword, user.newPassword).then(() => {
        proxy.$modal.msgSuccess("修改成功")
        // 清除表单数据
        user.oldPassword = undefined
        user.newPassword = undefined
        user.confirmPassword = undefined
        proxy.$refs.pwdRef.resetFields()
      }).catch(() => {
        proxy.$modal.msgError("修改密码失败")
      }).finally(() => {
        submitting.value = false
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>

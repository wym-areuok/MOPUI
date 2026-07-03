<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="language-icon--style">
      <svg-icon class-name="language-icon" icon-class="language" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item of localeOptions"
          :key="item.value"
          :disabled="currentLocale === item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useLocaleStore } from '@/store/modules/locale'

const localeStore = useLocaleStore()
const { currentLocale, localeOptions } = localeStore

function handleSetLanguage(lang) {
  localeStore.setLocale(lang)
  // 切换语言后刷新页面确保所有组件更新
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.language-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>

<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/wym-areuok/MesToolsUI.git')

function goto() {
  window.open(url.value)
}
</script>

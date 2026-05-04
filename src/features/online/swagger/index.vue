<script setup lang="ts">
const goDoc = () => {
  window.open(`${import.meta.env.VITE_REQUEST_BASE_URL}doc.html`)
}

onMounted(() => {
  goDoc()
})
</script>

<template>
  <div>
    <n-button type="primary" ghost @click="goDoc"> 点 击 </n-button>
  </div>
</template>

<style scoped></style>

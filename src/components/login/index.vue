<script setup lang="ts">
import { useLoginCore } from './composable/useLoginCore'
import LoginSkin from './skins/BeautifulLoginSkin.vue'

const login = useLoginCore()
</script>

<template>
  <LoginSkin :login="login" />
</template>

<style scoped></style>

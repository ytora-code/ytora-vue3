<script setup lang="ts">
import Sider from './sider/index.vue'
import Header from './header/index.vue'
import Content from './content/index.vue'
</script>

<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="90"
      show-trigger="arrow-circle"
    >
      <Sider></Sider>
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered>
        <Header></Header>
      </n-layout-header>

      <n-layout-content>
        <Content></Content>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>

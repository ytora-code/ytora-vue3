<script setup lang="ts">
import Sider from './sider/index.vue'
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
        <div h="[50px]">
        </div>
      </n-layout-header>

      <n-layout-content>
        <div h="[calc(100vh-60px)]">
          <router-view></router-view>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>

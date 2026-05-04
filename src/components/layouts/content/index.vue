<script setup lang="ts"></script>

<template>
  <n-scrollbar class="layout-content">
    <div class="layout-content__inner">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </div>
  </n-scrollbar>
</template>

<style scoped>
.layout-content {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--global-bg-color);
  transition: background-color var(--global-layout-transition-duration);
}

.layout-content__inner {
  min-width: 0;
  min-height: 100%;
}
</style>

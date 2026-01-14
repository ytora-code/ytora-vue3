<script setup lang="ts"></script>

<template>
  <n-scrollbar h="[calc(100vh-60px)]">
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
  </n-scrollbar>
</template>

<style scoped></style>

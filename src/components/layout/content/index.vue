<script setup lang="ts"></script>

<template>
  <n-scrollbar h="[calc(100vh-60px)]">
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </n-scrollbar>
</template>

<style scoped></style>

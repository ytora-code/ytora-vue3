<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="not-found-page">
    <n-card class="not-found-page__card" :bordered="false">
      <div class="not-found-page__art">
        <span class="not-found-page__digit">4</span>
        <div class="not-found-page__core">
          <div class="not-found-page__ring" />
          <div class="not-found-page__dot" />
        </div>
        <span class="not-found-page__digit">4</span>
      </div>

      <div class="not-found-page__content">
        <h1 class="not-found-page__title">页面不存在</h1>
        <p class="not-found-page__desc">
          你访问的页面可能已被删除、路径填写错误，或者当前账号没有对应访问权限。
        </p>

        <div class="not-found-page__actions">
          <n-button type="primary" @click="goHome">返回首页</n-button>
          <n-button secondary @click="goBack">返回上一页</n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  min-height: calc(100vh - 160px);
  padding: 24px;
}

.not-found-page__card {
  overflow: hidden;
  padding: 32px 24px;
  border-radius: 5px;
  background:
    radial-gradient(circle at top left, rgba(41, 121, 255, 0.12), transparent 32%),
    radial-gradient(circle at right bottom, rgba(16, 185, 129, 0.12), transparent 28%),
    linear-gradient(135deg, #ffffff, #f6f9fc);
}

.not-found-page__art {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;
}

.not-found-page__digit {
  font-size: clamp(72px, 14vw, 132px);
  font-weight: 800;
  line-height: 1;
  color: #1f2937;
  letter-spacing: -4px;
}

.not-found-page__core {
  position: relative;
  display: grid;
  place-items: center;
  width: clamp(84px, 12vw, 120px);
  height: clamp(84px, 12vw, 120px);
}

.not-found-page__ring {
  width: 100%;
  height: 100%;
  border: 14px solid #1f8acb;
  border-radius: 999px;
  box-shadow:
    0 18px 40px rgba(31, 138, 203, 0.18),
    inset 0 0 0 6px rgba(255, 255, 255, 0.7);
}

.not-found-page__dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.15);
}

.not-found-page__content {
  text-align: center;
}

.not-found-page__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.not-found-page__desc {
  max-width: 560px;
  margin: 12px auto 0;
  font-size: 14px;
  line-height: 1.8;
  color: #6b7280;
}

.not-found-page__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .not-found-page {
    min-height: calc(100vh - 120px);
    padding: 16px;
  }

  .not-found-page__card {
    padding: 24px 16px;
    border-radius: 16px;
  }

  .not-found-page__art {
    gap: 10px;
  }

  .not-found-page__ring {
    border-width: 10px;
  }

  .not-found-page__title {
    font-size: 22px;
  }
}
</style>

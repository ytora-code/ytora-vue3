import type { App } from 'vue'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

import { ensureSessionLogoutSSE } from '@/components/login/composable/useSessionLogoutSSE'
import router from '@/router'
import { useUserStore } from '@/stores/userStore'

const pinia = createPinia()

export async function setupApp(app: App) {
  app.use(pinia)
  app.use(VueQueryPlugin)
  const initialized = await useUserStore(pinia).initUserSession()
  app.use(router)

  if (initialized) {
    ensureSessionLogoutSSE(router)
  }
}

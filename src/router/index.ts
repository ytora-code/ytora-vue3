import { createRouter, createWebHistory } from 'vue-router'

import setupRouterGuard from './guard'
import toRoutes from './toRoutes'
import constantRoutes from './constantRoutes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: toRoutes(constantRoutes),
  scrollBehavior: () => ({ top: 0 }),
})

// 注册路由守卫
setupRouterGuard(router)

export default router

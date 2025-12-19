import { createRouter, createWebHistory } from 'vue-router'
import toRoutes from '@/router/toRoutes.ts'
import constantRoutes from './constantRoutes.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: toRoutes(constantRoutes),
  //滚动行为
  scrollBehavior() {
    //一滚动，水平方向归零，top方向也归零
    return {
      left: 0,
      top: 0,
    }
  },
})

export default router

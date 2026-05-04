import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { computed, ref } from 'vue'

export interface VisitedTab {
  title: string
  path: string
  fullPath: string
  name: string
  closable: boolean
}

const HOME_PATH = '/home'

const resolveTabTitle = (route: Pick<RouteLocationNormalizedLoaded, 'meta' | 'name' | 'path'>) =>
  String(route.meta.title || route.name || route.path || '未命名页面')

const resolveTabName = (route: Pick<RouteLocationNormalizedLoaded, 'name' | 'path'>) =>
  typeof route.name === 'string' ? route.name : route.path

const shouldTrackRoute = (route: Pick<RouteLocationNormalizedLoaded, 'path' | 'meta'>) => {
  if (!route.path || route.path === '/' || route.path === '/login') {
    return false
  }

  if (route.meta.hidden === true) {
    return false
  }

  return true
}

export const useTabsStore = defineStore('tabs', () => {
  const visitedTabs = ref<VisitedTab[]>([
    {
      title: '首页',
      path: HOME_PATH,
      fullPath: HOME_PATH,
      name: HOME_PATH,
      closable: false,
    },
  ])

  const cachedTabNames = computed(() =>
    visitedTabs.value.map((item) => item.name).filter((item) => item !== HOME_PATH),
  )

  const addVisitedTab = (route: RouteLocationNormalizedLoaded) => {
    if (!shouldTrackRoute(route)) {
      return
    }

    const existing = visitedTabs.value.find((item) => item.path === route.path)
    if (existing) {
      existing.fullPath = route.fullPath
      existing.title = resolveTabTitle(route)
      existing.name = resolveTabName(route)
      return
    }

    visitedTabs.value.push({
      title: resolveTabTitle(route),
      path: route.path,
      fullPath: route.fullPath,
      name: resolveTabName(route),
      closable: route.path !== HOME_PATH,
    })
  }

  const removeVisitedTab = (path: string) => {
    visitedTabs.value = visitedTabs.value.filter((item) => item.path !== path || !item.closable)
  }

  const removeOtherTabs = (path: string) => {
    visitedTabs.value = visitedTabs.value.filter((item) => !item.closable || item.path === path)
  }

  const removeAllTabs = () => {
    visitedTabs.value = visitedTabs.value.filter((item) => !item.closable)
  }

  const removeLeftTabs = (path: string) => {
    const currentIndex = visitedTabs.value.findIndex((item) => item.path === path)
    if (currentIndex <= 0) {
      return
    }

    visitedTabs.value = visitedTabs.value.filter(
      (item, index) => !item.closable || index >= currentIndex,
    )
  }

  const removeRightTabs = (path: string) => {
    const currentIndex = visitedTabs.value.findIndex((item) => item.path === path)
    if (currentIndex < 0) {
      return
    }

    visitedTabs.value = visitedTabs.value.filter(
      (item, index) => !item.closable || index <= currentIndex,
    )
  }

  return {
    visitedTabs,
    cachedTabNames,
    addVisitedTab,
    removeVisitedTab,
    removeOtherTabs,
    removeAllTabs,
    removeLeftTabs,
    removeRightTabs,
  }
})

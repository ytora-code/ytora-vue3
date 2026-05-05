import { defineStore } from 'pinia'

import iconApi from '@/features/sys/icon/api/IconApi'
import type SysIconData from '@/features/sys/icon/type/SysIconData'

/**
 * icon缓存
 */
export default defineStore('iconStore', () => {
  /**
   * icon缓存
   */
  const iconCache = ref<Record<string, SysIconData>>({})
  const loadingTasks = new Map<string, Promise<SysIconData | null>>()
  const missingCodes = new Set<string>()

  const getCachedIcon = (code?: string | null) => {
    if (!code) {
      return null
    }

    return iconCache.value[code] ?? null
  }

  const ensureIcon = async (code?: string | null) => {
    if (!code) {
      return null
    }

    if (iconCache.value[code]) {
      return iconCache.value[code]
    }

    if (missingCodes.has(code)) {
      return null
    }

    const existingTask = loadingTasks.get(code)
    if (existingTask) {
      return existingTask
    }

    const task = iconApi
      .queryByCode(code)
      .then((iconData) => {
        if (!iconData) {
          missingCodes.add(code)
          return null
        }

        iconCache.value[code] = iconData
        return iconData
      })
      .catch((error) => {
        missingCodes.add(code)
        console.error(error)
        return null
      })
      .finally(() => {
        loadingTasks.delete(code)
      })

    loadingTasks.set(code, task)
    return task
  }

  const ensureIcons = async (codes: Array<string | null | undefined>) => {
    const uniqueCodes = [...new Set(codes.filter((item): item is string => Boolean(item)))]
    await Promise.all(uniqueCodes.map((code) => ensureIcon(code)))
  }

  return {
    iconCache,
    getCachedIcon,
    ensureIcon,
    ensureIcons,
  }
})

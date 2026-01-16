import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileTreeStore = defineStore('fileTree', () => {
  /**
   * 展开节点
   */
  const expandedKeys = ref<Array<string | number>>([])
  /**
   * 选中节点
   */
  const selectedKeys = ref<Array<string | number>>([])
  /**
   * 已懒加载过的节点（避免重复请求）
   */
  const loadedKeys = ref<Set<string | number>>(new Set())

  function setExpandedKeys(keys: Array<string | number>) {
    expandedKeys.value = keys
  }
  function setSelectedKeys(keys: Array<string | number>) {
    selectedKeys.value = keys
  }
  function markLoaded(key: string | number) {
    loadedKeys.value.add(key)
  }
  function resetLoadedKeys() {
    loadedKeys.value = new Set()
  }

  function reset() {
    expandedKeys.value = []
    selectedKeys.value = []
    loadedKeys.value = new Set()
  }

  return {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    setExpandedKeys,
    setSelectedKeys,
    markLoaded,
    resetLoadedKeys,
    reset,
  }
})

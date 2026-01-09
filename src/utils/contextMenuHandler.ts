import { useContextMenuStore } from '@/stores/useContextMenu.ts'
import type { DropdownOption } from 'naive-ui'
import type { ContextMenuBinding, MenuKey } from '@/types/ContextMenu.ts'

// 默认菜单项配置
const defaultOptions: DropdownOption[] = [
  { label: '刷新页面', key: 'refresh' },
  { label: '返回首页', key: 'home' },
  { type: 'divider', key: 'd1' },
  { label: '打印', key: 'print' },
]

// 默认处理函数
const defaultHandler = (key: MenuKey) => {
  if (key === 'refresh') location.reload()
  if (key === 'home') window.location.href = '/'
  console.log('执行默认逻辑:', key)
}

// 存储自定义信息的 WeakMap (防止内存泄漏)
export const customMenuMap = new WeakMap<HTMLElement, ContextMenuBinding>()

export function setupGlobalContextMenu() {
  const store = useContextMenuStore()

  window.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // 寻找最近的带有自定义菜单信息的父元素
    const customEl = target.closest('[data-context-menu-mark]') as HTMLElement | null

    if (customEl && customMenuMap.has(customEl)) {
      // 1. 局部定制逻辑
      const binding = customMenuMap.get(customEl)!
      store.openMenu(e, binding.options, binding.handler)
    } else {
      // 2. 全局默认逻辑
      store.openMenu(e, defaultOptions, defaultHandler)
    }
  })
}

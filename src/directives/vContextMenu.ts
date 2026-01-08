import type { App, DirectiveBinding } from 'vue'
import { customMenuMap } from '@/utils/contextMenuHandler'
import type { ContextMenuBinding } from '@/types/ContextMenu.ts'

export const contextMenuDirective = {
  install(app: App) {
    app.directive('context-menu', {
      mounted(el: HTMLElement, binding: DirectiveBinding<ContextMenuBinding>) {
        // 标记该元素有自定义菜单
        el.setAttribute('data-context-menu-mark', 'true')
        // 存储配置
        customMenuMap.set(el, binding.value)
      },
      updated(el: HTMLElement, binding: DirectiveBinding<ContextMenuBinding>) {
        customMenuMap.set(el, binding.value)
      },
      unmounted(el: HTMLElement) {
        customMenuMap.delete(el)
      }
    })
  }
}

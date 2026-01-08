import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'
import type { DropdownOption } from 'naive-ui'
import type { MenuKey } from '@/types/ContextMenu.ts'

export const useContextMenuStore = defineStore('contextMenu', () => {
  const show = ref(false)
  const x = ref(0)
  const y = ref(0)
  const options = ref<DropdownOption[]>([])
  const currentHandler = ref<((key: MenuKey) => void) | null>(null)

  const openMenu = async (event: MouseEvent, menuOptions: DropdownOption[], handler: (key: MenuKey) => void) => {
    event.preventDefault()
    show.value = false
    currentHandler.value = null

    x.value = event.clientX
    y.value = event.clientY
    options.value = menuOptions
    currentHandler.value = handler

    await nextTick()
    show.value = true
  }

  const closeMenu = () => {
    show.value = false
  }

  return { show, x, y, options, currentHandler, openMenu, closeMenu }
})

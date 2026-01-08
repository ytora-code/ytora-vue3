import type { DropdownOption } from 'naive-ui'

export type MenuKey = string | number

export interface ContextMenuBinding {
  options: DropdownOption[]
  handler: (key: MenuKey) => void
}

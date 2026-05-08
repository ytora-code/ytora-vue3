import type { TreeOption } from 'naive-ui'

import type SysDynamicApiGroupData from '../type/SysDynamicApiGroupData'
import type SysDynamicApiGroupParam from '../type/SysDynamicApiGroupParam'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'

export interface GroupTreeNode extends SysDynamicApiGroupData {
  children?: GroupTreeNode[]
}

export interface GroupFormModel extends SysDynamicApiGroupParam {
  id?: string
  pid?: string
  name: string
  remark: string
}

export interface FormInstance {
  validate: () => Promise<void>
}

export const ROOT_PID = ''

export const createInitialGroupFormModel = (): GroupFormModel => ({
  id: undefined,
  pid: ROOT_PID,
  name: '',
  remark: '',
})

export const toTreeOption = (group: GroupTreeNode): TreeOption => ({
  key: group.id,
  label: group.name || '未命名分组',
  raw: group,
  children: group.children?.map((item) => toTreeOption(item)),
})

export const getNodeKey = (node: TreeOption): string | number => node.key ?? ''

export const findTreeNode = (nodes: TreeOption[], id?: string): TreeOption | null => {
  if (!id) return null

  for (const node of nodes) {
    if (String(getNodeKey(node)) === String(id)) {
      return node
    }

    const children = Array.isArray(node.children) ? node.children : []
    const matched = findTreeNode(children, id)
    if (matched) {
      return matched
    }
  }

  return null
}

export const getFirstNode = (nodes: TreeOption[]) => {
  for (const node of nodes) {
    return node
  }

  return null
}

export const collectExpandedKeys = (nodes: TreeOption[]) => {
  const keys: Array<string | number> = []

  const walk = (items: TreeOption[]) => {
    items.forEach((item) => {
      const key = getNodeKey(item)
      if (key !== '') {
        keys.push(key)
      }

      const children = Array.isArray(item.children) ? item.children : []
      if (children.length) {
        walk(children)
      }
    })
  }

  walk(nodes)
  return keys
}

export const collectMatchedExpandedKeys = (nodes: TreeOption[], keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return collectExpandedKeys(nodes)
  }

  const keys = new Set<string | number>()

  const walk = (items: TreeOption[]): boolean => {
    let hasMatchedDescendant = false

    items.forEach((item) => {
      const label = String(item.label ?? '').toLowerCase()
      const selfMatched = label.includes(normalizedKeyword)
      const children = Array.isArray(item.children) ? item.children : []
      const childMatched = children.length > 0 ? walk(children) : false

      if (childMatched) {
        const key = getNodeKey(item)
        if (key !== '') {
          keys.add(key)
        }
      }

      if (selfMatched || childMatched) {
        hasMatchedDescendant = true
      }
    })

    return hasMatchedDescendant
  }

  walk(nodes)
  return [...keys]
}

export const menuIcon = (name: string) => {
  const iconRender = renderIcon(name)
  return iconRender ? iconRender() : null
}

import type { TreeOption } from 'naive-ui'

import { DEPART_TYPE_OPTIONS } from './useSchema'
import type SysDepartData from '../type/SysDepartData'
import type SysDepartParam from '../type/SysDepartParam'
import { renderIcon } from '@/utils/icon'

export interface FormInstance {
  validate: () => Promise<void>
}

export const ROOT_PID = '0'

export const createInitialDepartModel = (): SysDepartParam => ({
  id: undefined,
  pid: ROOT_PID,
  departName: '',
  departCode: '',
  type: '',
  contactId: '',
  remark: '',
})

export const normalizeDepartForForm = (depart: SysDepartData): SysDepartParam => ({
  id: depart.id,
  pid: depart.pid ?? ROOT_PID,
  departName: depart.departName ?? '',
  departCode: depart.departCode ?? '',
  type: depart.type ?? '',
  contactId: depart.contactId ?? '',
  remark: depart.remark ?? '',
})

export const toTreeOption = (depart: SysDepartData): TreeOption => ({
  key: depart.id,
  label: depart.departName,
  raw: depart,
  children: depart.children?.map((item) => toTreeOption(item)),
})

export const getNodeKey = (node: TreeOption): string | number => node.key ?? ''

export const findTreeNode = (nodes: TreeOption[], id?: string | null): TreeOption | null => {
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

export const collectExpandedKeys = (nodes: TreeOption[]): Array<string | number> => {
  const keys: Array<string | number> = []

  const walk = (items: TreeOption[]) => {
    items.forEach((item) => {
      const nodeKey = getNodeKey(item)
      if (!nodeKey) {
        return
      }

      keys.push(nodeKey)
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children)
      }
    })
  }

  walk(nodes)
  return keys
}

export const collectMatchedExpandedKeys = (
  nodes: TreeOption[],
  keyword: string,
): Array<string | number> => {
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
        const nodeKey = getNodeKey(item)
        if (nodeKey !== '') {
          keys.add(nodeKey)
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

export const getFirstNode = (nodes: TreeOption[]): TreeOption | null => {
  for (const node of nodes) {
    return node
  }

  return null
}

export const buildTypeLabel = (type?: string) =>
  DEPART_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? '未设置'

export const menuIcon = (name: string) => {
  const iconRender = renderIcon(name)
  return iconRender ? iconRender() : null
}

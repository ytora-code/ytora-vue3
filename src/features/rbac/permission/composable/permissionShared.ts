import type { TreeOption } from 'naive-ui'

import { PERMISSION_TYPE_OPTIONS } from './useSchema'
import type SysPermissionData from '../type/SysPermissionData'
import type SysPermissionParam from '../type/SysPermissionParam'
import { renderIcon } from '@/utils/icon'

export interface FormInstance {
  validate: () => Promise<void>
}

export const ROOT_PID = '0'

export const createInitialPermissionModel = (): SysPermissionParam => ({
  id: undefined,
  pid: ROOT_PID,
  permissionName: '',
  permissionCode: '',
  permissionType: 2,
  component: '',
  icon: '',
  meta: '',
  visible: true,
  index: undefined,
  redirect: '',
  remark: '',
})

export const normalizePermissionForForm = (permission: SysPermissionData): SysPermissionParam => ({
  id: permission.id,
  pid: permission.pid ?? ROOT_PID,
  permissionName: permission.permissionName ?? '',
  permissionCode: permission.permissionCode ?? '',
  permissionType: permission.permissionType,
  component: permission.component ?? '',
  icon: permission.icon ?? '',
  meta:
    typeof permission.meta === 'string'
      ? permission.meta
      : permission.meta
        ? JSON.stringify(permission.meta, null, 2)
        : '',
  visible: permission.visible ?? true,
  index: permission.index,
  redirect: permission.redirect ?? '',
  remark: permission.remark ?? '',
})

export const toTreeOption = (permission: SysPermissionData): TreeOption => ({
  key: permission.id,
  label: permission.permissionName,
  raw: permission,
  children: permission.children?.map((item) => toTreeOption(item)),
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

export const buildTypeLabel = (type?: number) =>
  PERMISSION_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? '未设置'

export const menuIcon = (name: string) => {
  const iconRender = renderIcon(name)
  return iconRender ? iconRender() : null
}

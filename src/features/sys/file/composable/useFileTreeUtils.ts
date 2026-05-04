import type { TreeOption } from 'naive-ui'
import type SysFolderData from '@/features/sys/file/type/SysFolderData'

export const TEMP_NODE_PREFIX = 'temp-'

/**
 * 将文件树原始数据转换为 Naive UI Tree 节点。
 */
export const toTreeOption = (folder: SysFolderData): TreeOption => {
  const isFile = folder.type === 2

  return {
    id: folder.id,
    path: folder.path,
    isLeaf: isFile,
    children: isFile ? [] : undefined,
    raw: folder,
  } as TreeOption
}

export const getTreeNodeId = (option: TreeOption) => option.id as string | number

export const isFileTreeNode = (option: TreeOption) =>
  (option.raw as SysFolderData | undefined)?.type === 2

export const isTempNodeId = (id: string) => id.startsWith(TEMP_NODE_PREFIX)

export function findNodeById(nodes: TreeOption[], targetId: string | number): TreeOption | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }

    const children = Array.isArray(node.children) ? node.children : []
    const matchedNode = children.length ? findNodeById(children, targetId) : null
    if (matchedNode) {
      return matchedNode
    }
  }

  return null
}

export function updateNodeById(
  nodes: TreeOption[],
  targetId: string | number,
  patch: Partial<TreeOption>,
): TreeOption[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, ...patch }
    }

    if (Array.isArray(node.children) && node.children.length) {
      return {
        ...node,
        children: updateNodeById(node.children, targetId, patch),
      }
    }

    return node
  })
}

export function setChildrenById(
  nodes: TreeOption[],
  targetId: string | number,
  children: TreeOption[],
): TreeOption[] {
  return nodes.map((node) => {
    const nodeId = getTreeNodeId(node)
    if (nodeId === targetId) {
      return {
        ...node,
        children,
        isLeaf: isFileTreeNode(node),
      }
    }

    if (Array.isArray(node.children) && node.children.length) {
      return {
        ...node,
        children: setChildrenById(node.children, targetId, children),
      }
    }

    return node
  })
}

export function appendChildNode(
  nodes: TreeOption[],
  parentId: string | number,
  childNode: TreeOption,
): TreeOption[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const baseChildren = Array.isArray(node.children) ? node.children : []
      return {
        ...node,
        children: [...baseChildren, childNode],
        isLeaf: false,
      }
    }

    if (Array.isArray(node.children) && node.children.length) {
      return {
        ...node,
        children: appendChildNode(node.children, parentId, childNode),
      }
    }

    return node
  })
}

export function removeNodeById(nodes: TreeOption[], targetId: string | number): TreeOption[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      const nextChildren = Array.isArray(node.children)
        ? removeNodeById(node.children, targetId)
        : node.children

      return nextChildren === node.children ? node : { ...node, children: nextChildren }
    })
}

export const ensureExpandedKey = (expandedKeys: Array<string | number>, key: string | number) => {
  if (!expandedKeys.includes(key)) {
    expandedKeys.push(key)
  }
}

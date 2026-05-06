import { computed, h, ref } from 'vue'
import { NButton, type TreeOption } from 'naive-ui'

import sysPermissionApi from '@/features/rbac/permission/api/SysPermissionApi'
import type SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import type SysRolePermissionParam from '@/features/rbac/permission/type/SysRolePermissionParam'
import type SysRoleData from '../type/data/SysRoleData'
import { renderIcon } from '@/features/sys/icon/composable/useIcon'
import { message } from '@/utils/naiveApi'

const toTreeOption = (permission: SysPermissionData): TreeOption => ({
  key: permission.id,
  label: permission.permissionName,
  raw: permission,
  children: permission.children?.map((item) => toTreeOption(item)),
})

const getNodeKey = (node: TreeOption): string | number => node.key ?? ''

const collectExpandedKeys = (nodes: TreeOption[]): Array<string | number> => {
  const keys: Array<string | number> = []

  const walk = (items: TreeOption[]) => {
    items.forEach((item) => {
      const key = getNodeKey(item)
      if (key) {
        keys.push(key)
      }

      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children)
      }
    })
  }

  walk(nodes)
  return keys
}

const fallbackIconName = (permission: SysPermissionData, isExpanded: boolean) => {
  const hasChildren = Array.isArray(permission.children) && permission.children.length > 0
  if (hasChildren) {
    return isExpanded ? 'FolderOpen' : 'Folder'
  }

  return permission.permissionType === 2 ? 'FileText' : 'SquareMousePointer'
}

const useRolePermission = () => {
  const permissionDrawerVisible = ref(false)
  const permissionTreeLoading = ref(false)
  const permissionSubmitLoading = ref(false)
  const permissionTreeData = ref<TreeOption[]>([])
  const permissionExpandedKeys = ref<Array<string | number>>([])
  const checkedPermissionKeys = ref<Array<string | number>>([])
  const originPermissionIds = ref<string[]>([])
  const currentRole = ref<SysRoleData | null>(null)
  const permissionDetailVisible = ref(false)
  const currentPermission = ref<SysPermissionData | null>(null)

  const permissionDrawerTitle = computed(() => {
    if (!currentRole.value) {
      return '角色资源授权'
    }

    return `资源授权：${currentRole.value.roleName || currentRole.value.roleCode || currentRole.value.id}`
  })

  const currentRoleCode = computed(() => currentRole.value?.roleCode || '-')
  const currentRoleId = computed(() => currentRole.value?.id || null)
  const currentRoleRemark = computed(() => currentRole.value?.remark || '暂无备注')

  const closePermissionDrawer = () => {
    permissionDrawerVisible.value = false
    permissionTreeLoading.value = false
    permissionSubmitLoading.value = false
    permissionTreeData.value = []
    permissionExpandedKeys.value = []
    checkedPermissionKeys.value = []
    originPermissionIds.value = []
    currentRole.value = null
  }

  const openPermissionDrawer = async (role: SysRoleData) => {
    if (!role?.id) {
      message.warning('缺少角色ID，无法配置资源')
      return
    }

    currentRole.value = role
    permissionDrawerVisible.value = true
    permissionTreeLoading.value = true

    try {
      const result = await sysPermissionApi.treePermissionByRoleId(role.id)
      permissionTreeData.value = result.tree.map((item) => toTreeOption(item))
      permissionExpandedKeys.value = collectExpandedKeys(permissionTreeData.value)
      originPermissionIds.value = [...result.permissionIds]
      checkedPermissionKeys.value = [...result.permissionIds]
    } catch (error) {
      console.error(error)
      closePermissionDrawer()
    } finally {
      permissionTreeLoading.value = false
    }
  }

  const handlePermissionCheckedKeysUpdate = (
    keys: Array<string | number>,
    _options: Array<TreeOption | null>,
    _meta: {
      node: TreeOption | null
      action: 'check' | 'uncheck'
    },
  ) => {
    checkedPermissionKeys.value = keys
  }

  const expandAllPermissions = () => {
    permissionExpandedKeys.value = collectExpandedKeys(permissionTreeData.value)
  }

  const collapseAllPermissions = () => {
    permissionExpandedKeys.value = []
  }

  const openPermissionDetail = (permission: SysPermissionData) => {
    currentPermission.value = permission
    permissionDetailVisible.value = true
  }

  const closePermissionDetail = () => {
    permissionDetailVisible.value = false
    currentPermission.value = null
  }

  const renderPermissionPrefix = ({ option }: { option: TreeOption }) => {
    const raw = option.raw as SysPermissionData
    const iconRender = renderIcon(raw.icon)
    if (iconRender) {
      return iconRender()
    }

    const isExpanded = permissionExpandedKeys.value.includes(getNodeKey(option))
    const iconName = fallbackIconName(raw, isExpanded)
    const fallbackRender = renderIcon(iconName)
    return fallbackRender ? fallbackRender() : null
  }

  const renderPermissionLabel = ({ option }: { option: TreeOption }) => {
    const raw = option.raw as SysPermissionData
    return h('div', { class: 'role-permission-tree__label' }, [
      h('span', { class: 'role-permission-tree__name' }, raw.permissionName || '未命名资源'),
      h(
        NButton,
        {
          size: 'tiny',
          quaternary: true,
          type: 'primary',
          class: 'role-permission-tree__detail-button',
          onClick: (event: MouseEvent) => {
            event.stopPropagation()
            openPermissionDetail(raw)
          },
        },
        { default: () => '详情' },
      ),
    ])
  }

  const submitRolePermission = async () => {
    if (!currentRole.value?.id) {
      message.warning('缺少角色信息，无法保存')
      return
    }

    permissionSubmitLoading.value = true

    try {
      await sysPermissionApi.refreshRolePermission({
        roleId: currentRole.value.id,
        originPermissionIds: [...originPermissionIds.value],
        currentPermissionIds: checkedPermissionKeys.value.map((item) => String(item)),
      } as SysRolePermissionParam)
      closePermissionDrawer()
    } catch (error) {
      console.error(error)
    } finally {
      permissionSubmitLoading.value = false
    }
  }

  return {
    checkedPermissionKeys,
    closePermissionDrawer,
    collapseAllPermissions,
    currentRoleId,
    currentRoleCode,
    currentRoleRemark,
    currentPermission,
    expandAllPermissions,
    handlePermissionCheckedKeysUpdate,
    closePermissionDetail,
    openPermissionDrawer,
    permissionDetailVisible,
    permissionDrawerTitle,
    permissionDrawerVisible,
    permissionExpandedKeys,
    permissionSubmitLoading,
    permissionTreeData,
    permissionTreeLoading,
    renderPermissionLabel,
    renderPermissionPrefix,
    submitRolePermission,
  }
}

export default useRolePermission

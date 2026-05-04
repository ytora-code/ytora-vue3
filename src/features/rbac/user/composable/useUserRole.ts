import { computed, ref } from 'vue'
import { message } from '@/utils/naiveApi'

import sysRoleApi from '@/features/rbac/role/api/SysRoleApi'
import type SysUserRoleData from '@/features/rbac/role/type/data/SysUserRoleData'
import type SysUserRoleMapperParam from '@/features/rbac/role/type/param/SysUserRoleMapperParam'
import type SysUserData from '@/features/rbac/user/type/SysUserData'

const createInitialSearchFormModel = (): SysUserRoleMapperParam => ({
  roleName: '',
  roleCode: '',
})

const useUserRole = () => {
  const visible = ref(false)
  const drawerLoading = ref(false)
  const tableLoading = ref(false)
  const currentUser = ref<SysUserData | null>(null)

  const searchFormModel = ref<SysUserRoleMapperParam>(createInitialSearchFormModel())
  const pageNo = ref(1)
  const pageSize = ref(10)
  const total = ref<number>(0)
  const records = ref<SysUserRoleData[]>([])
  const updatingRoleIds = ref<string[]>([])

  const currentUserName = computed(() => currentUser.value?.userName || '-')

  const currentUserId = computed(() => currentUser.value?.id)

  const page = async () => {
    if (!currentUserId.value) {
      return
    }

    tableLoading.value = true
    try {
      const result = await sysRoleApi.listUserRoleMapper({
        ...searchFormModel.value,
        userId: currentUserId.value,
        pageNo: pageNo.value,
        pageSize: pageSize.value,
      })

      pageNo.value = result.pageNo
      pageSize.value = result.pageSize
      total.value = result.total ?? 0
      records.value = result.records
    } catch (error) {
      console.error(error)
    } finally {
      tableLoading.value = false
    }
  }

  const search = async () => {
    pageNo.value = 1
    await page()
  }

  const resetSearch = async () => {
    searchFormModel.value = createInitialSearchFormModel()
    pageNo.value = 1
    await page()
  }

  const pageChange = async (newPageNo: number) => {
    pageNo.value = newPageNo
    await page()
  }

  const pageSizeChange = async (newPageSize: number) => {
    pageNo.value = 1
    pageSize.value = newPageSize
    await page()
  }

  const open = async (user: SysUserData) => {
    if (!user?.id) {
      message.error('缺少用户ID，无法分配角色')
      return
    }

    currentUser.value = user
    visible.value = true
    drawerLoading.value = true
    searchFormModel.value = createInitialSearchFormModel()
    pageNo.value = 1

    try {
      await page()
    } finally {
      drawerLoading.value = false
    }
  }

  const close = () => {
    visible.value = false
  }

  const handleAfterLeave = () => {
    visible.value = false
    drawerLoading.value = false
    tableLoading.value = false
    currentUser.value = null
    searchFormModel.value = createInitialSearchFormModel()
    pageNo.value = 1
    pageSize.value = 10
    total.value = 0
    records.value = []
    updatingRoleIds.value = []
  }

  const resolveRoleId = (row: SysUserRoleData) => row.roleId || row.id

  const isRoleUpdating = (roleId?: string) => !!roleId && updatingRoleIds.value.includes(roleId)

  const updateRoleOwner = (roleId: string, owner: boolean) => {
    records.value = records.value.map((item) =>
      resolveRoleId(item) === roleId ? { ...item, owner } : item,
    )
  }

  const toggleRole = async (row: SysUserRoleData, add: boolean) => {
    const userId = currentUserId.value
    const roleId = resolveRoleId(row)

    if (!userId || !roleId) {
      message.error('缺少用户或角色标识，无法更新绑定关系')
      return
    }

    if (isRoleUpdating(roleId)) {
      return
    }

    updatingRoleIds.value = [...updatingRoleIds.value, roleId]
    try {
      await sysRoleApi.refreshUserRoleMapper({
        userId,
        roleId,
        add,
      })
      updateRoleOwner(roleId, add)
    } catch (error) {
      console.error(error)
    } finally {
      updatingRoleIds.value = updatingRoleIds.value.filter((item) => item !== roleId)
    }
  }

  return {
    visible,
    drawerLoading,
    tableLoading,
    currentUserName,
    currentUserId,
    searchFormModel,
    pageNo,
    pageSize,
    total,
    records,
    open,
    close,
    handleAfterLeave,
    search,
    resetSearch,
    pageChange,
    pageSizeChange,
    toggleRole,
    isRoleUpdating,
  }
}

export default useUserRole

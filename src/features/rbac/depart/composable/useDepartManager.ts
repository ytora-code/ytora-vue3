import { inject, provide, ref, type InjectionKey } from 'vue'
import { message } from '@/utils/naiveApi'

import userApi from '@/features/rbac/user/api/UserApi'
import type SysUserData from '@/features/rbac/user/type/SysUserData'
import type PageParam from '@/types/PageParam'
import useDepartContextMenu from './useDepartContextMenu'
import useDepartCrud from './useDepartCrud'
import { menuIcon, ROOT_PID } from './departShared'
import type SysDepartData from '../type/SysDepartData'

type ContactPickerTarget = 'edit'

const createDepartManager = () => {
  const activeTab = ref<'detail' | 'users'>('detail')

  const contactDialogVisible = ref(false)
  const contactDialogLoading = ref(false)
  const contactUserOptions = ref<SysUserData[]>([])
  const contactUserPageNo = ref(1)
  const contactUserPageSize = ref(10)
  const contactUserTotal = ref(0)
  const checkedContactUserKeys = ref<Array<string | number>>([])
  const selectedContactUser = ref<SysUserData | null>(null)
  const contactPickerTarget = ref<ContactPickerTarget>('edit')

  const crud = useDepartCrud()

  const {
    closeEditDialog,
    currentDepart,
    currentDepartId,
    deleteDepart,
    editContactName,
    editDialogTitle,
    editDialogVisible,
    editFormModel,
    editFormRef,
    expandedKeys,
    handleTreeSelect,
    loadTree,
    openCreateChildDialog,
    openCreateRootDialog,
    openEditDialog,
    selectedKeys,
    selectDepart,
    submitDialogLoading,
    submitEditDialog,
    treeData,
    treeLoading,
    treeRenderKey,
  } = crud

  const {
    closeContextMenu,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    handleBlankContextMenu,
    handleContextSelect,
    nodeProps,
  } = useDepartContextMenu({
    currentDepartId,
    selectDepart,
    openCreateRootDialog,
    openCreateChildDialog,
    openEditDialog,
    deleteDepart,
  })

  const loadContactUsers = async (params?: PageParam) => {
    contactDialogLoading.value = true

    try {
      const result = await userApi.page({
        pageNo: params?.pageNo ?? contactUserPageNo.value,
        pageSize: params?.pageSize ?? contactUserPageSize.value,
      })
      contactUserOptions.value = result.records
      contactUserPageNo.value = result.pageNo
      contactUserPageSize.value = result.pageSize
      contactUserTotal.value = result.total ?? result.records.length
    } catch (error) {
      console.error(error)
      contactUserOptions.value = []
      contactUserTotal.value = 0
    } finally {
      contactDialogLoading.value = false
    }
  }

  const renderPrefix = ({ option }: Parameters<typeof nodeProps>[0]) => {
    const raw = option.raw as SysDepartData

    if (!raw.pid || raw.pid === ROOT_PID) {
      return menuIcon('Building2')
    }

    switch (raw.type) {
      case 'headquarters':
        return menuIcon('Landmark')
      case 'business':
        return menuIcon('BriefcaseBusiness')
      case 'functional':
        return menuIcon('Blocks')
      case 'project':
        return menuIcon('Workflow')
      default:
        return menuIcon('Building')
    }
  }

  const openContactPicker = async (target: ContactPickerTarget) => {
    contactPickerTarget.value = target
    contactDialogVisible.value = true
    contactUserPageNo.value = 1
    checkedContactUserKeys.value = []
    selectedContactUser.value = null
    await loadContactUsers({ pageNo: 1, pageSize: contactUserPageSize.value })
  }

  const closeContactDialog = () => {
    contactDialogVisible.value = false
    contactDialogLoading.value = false
    contactUserOptions.value = []
    contactUserPageNo.value = 1
    contactUserTotal.value = 0
    checkedContactUserKeys.value = []
    selectedContactUser.value = null
  }

  const applyContactUser = (user: SysUserData) => {
    const contactName = user.realName?.trim() || user.userName?.trim() || ''
    editFormModel.value.contactId = user.id
    editContactName.value = contactName
  }

  const clearContact = () => {
    editFormModel.value.contactId = undefined
    editContactName.value = ''
  }

  const handleContactSelectionChange = (payload: {
    checkedRowKeys: Array<string | number>
    checkedRows: SysUserData[]
  }) => {
    const latestUser = payload.checkedRows.at(-1) ?? null
    const latestKey = latestUser?.id ?? payload.checkedRowKeys.at(-1)

    checkedContactUserKeys.value = latestKey ? [latestKey] : []
    selectedContactUser.value = latestUser
  }

  const confirmContactSelection = () => {
    if (!selectedContactUser.value?.id) {
      message.warning('请选择一个负责人')
      return
    }

    applyContactUser(selectedContactUser.value)
    closeContactDialog()
  }

  const handleContactUserPageChange = async (pageNo: number) => {
    await loadContactUsers({
      pageNo,
      pageSize: contactUserPageSize.value,
    })
  }

  const handleContactUserPageSizeChange = async (pageSize: number) => {
    await loadContactUsers({
      pageNo: 1,
      pageSize,
    })
  }

  return {
    activeTab,
    checkedContactUserKeys,
    clearContact,
    closeContactDialog,
    closeContextMenu,
    closeEditDialog,
    confirmContactSelection,
    contactDialogLoading,
    contactDialogVisible,
    contactUserOptions,
    contactUserPageNo,
    contactUserPageSize,
    contactUserTotal,
    contextOptions,
    ctxVisible,
    ctxX,
    ctxY,
    currentDepart,
    editContactName,
    editDialogTitle,
    editDialogVisible,
    editFormModel,
    editFormRef,
    expandedKeys,
    handleBlankContextMenu,
    handleContactSelectionChange,
    handleContactUserPageChange,
    handleContactUserPageSizeChange,
    handleContextSelect,
    handleTreeSelect,
    loadTree,
    nodeProps,
    openContactPicker,
    renderPrefix,
    selectedKeys,
    submitDialogLoading,
    submitEditDialog,
    treeData,
    treeRenderKey,
    treeLoading,
  }
}

type DepartManagerContext = ReturnType<typeof createDepartManager>

const departManagerKey: InjectionKey<DepartManagerContext> = Symbol('depart-manager')

const useDepartManager = () => {
  const injected = inject(departManagerKey, null)
  if (injected) {
    return injected
  }

  const manager = createDepartManager()
  provide(departManagerKey, manager)
  return manager
}

export default useDepartManager

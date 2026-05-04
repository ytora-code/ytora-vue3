import { computed, ref } from 'vue'
import { dialog, message } from '@/utils/naiveApi'

import type SysUserData from '@/features/rbac/user/type/SysUserData'
import type SysUserParam from '@/features/rbac/user/type/SysUserParam'
import userApi from '../api/UserApi'

interface DrawerFormInstance {
  validate: () => Promise<void>
}

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): SysUserParam => ({})

/**
 * 初始化抽屉的表单model
 */
const createInitialDrawerFormModel = (): SysUserParam => ({
  userName: '',
  realName: '',
  password: '',
  avatar: '',
  phone: '',
  email: '',
  birthday: '',
  idCard: '',
  remark: '',
  status: 1,
})

/**
 * 增删改查
 */
const useCrud = () => {
  // ========================================= 查询 =========================================

  const searchFormModel = ref<SysUserParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<SysUserData[]>([])
  const tableLoading = ref<boolean>(false)
  const checkedRowKeys = ref<Array<string | number>>([])

  const page = async () => {
    tableLoading.value = true
    try {
      const result = await userApi.page({
        ...searchFormModel.value,
        pageNo: pageNo.value,
        pageSize: pageSize.value,
      })
      pageNo.value = result.pageNo
      pageSize.value = result.pageSize
      pages.value = result.pages
      total.value = result.total
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

  // ========================================= 新增或编辑 =========================================

  const drawerVisible = ref<boolean>(false)
  const drawerLoading = ref<boolean>(false)
  const submitLoading = ref<boolean>(false)
  const drawerMode = ref<'create' | 'edit'>('create')
  const drawerFormRef = ref<DrawerFormInstance | null>(null)
  const drawerFormModel = ref<SysUserParam>(createInitialDrawerFormModel())
  const drawerTitle = computed(() => (drawerMode.value === 'create' ? '新增用户' : '编辑用户'))

  const openCreateDrawer = () => {
    drawerMode.value = 'create'
    drawerFormModel.value = createInitialDrawerFormModel()
    drawerVisible.value = true
  }

  const openEditDrawer = async (id?: string) => {
    if (!id) {
      message.error('缺少用户ID，无法编辑')
      return
    }

    drawerMode.value = 'edit'
    drawerVisible.value = true
    drawerLoading.value = true
    drawerFormModel.value = createInitialDrawerFormModel()

    try {
      const result = await userApi.queryById({ id } as SysUserParam)
      drawerFormModel.value = {
        ...createInitialDrawerFormModel(),
        ...result,
        status: result.status ? Number(result.status) : 1,
      }
    } catch (error) {
      console.error(error)
      drawerVisible.value = false
    } finally {
      drawerLoading.value = false
    }
  }

  const closeDrawer = () => {
    drawerVisible.value = false
  }

  const handleDrawerAfterLeave = () => {
    drawerLoading.value = false
    submitLoading.value = false
    drawerMode.value = 'create'
    drawerFormModel.value = createInitialDrawerFormModel()
  }

  const submitDrawer = async () => {
    await drawerFormRef.value?.validate()
    submitLoading.value = true

    try {
      await userApi.upsert({
        ...drawerFormModel.value,
        password: drawerFormModel.value.password?.trim() || undefined,
        avatar: drawerFormModel.value.avatar?.trim() || undefined,
        phone: drawerFormModel.value.phone?.trim() || undefined,
        email: drawerFormModel.value.email?.trim() || undefined,
        birthday: drawerFormModel.value.birthday?.trim() || undefined,
        idCard: drawerFormModel.value.idCard?.trim() || undefined,
        remark: drawerFormModel.value.remark?.trim() || undefined,
      } as SysUserParam)

      drawerVisible.value = false
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      submitLoading.value = false
    }
  }

  // ========================================= 删除 =========================================

  const deleteLoading = ref<boolean>(false)

  const deleteByIds = async (ids: Array<string | number>, adjustPage = false) => {
    deleteLoading.value = true

    try {
      await userApi.deleteByIds(ids)

      if (adjustPage && records.value.length === ids.length && pageNo.value > 1) {
        pageNo.value -= 1
      }

      const deletingKeys = new Set(ids.map((item) => String(item)))
      checkedRowKeys.value = checkedRowKeys.value.filter((key) => !deletingKeys.has(String(key)))
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      deleteLoading.value = false
    }
  }

  const confirmDelete = (ids: Array<string | number>, adjustPage = false) => {
    if (!ids.length) {
      message.warning('请先选择要删除的数据')
      return
    }

    dialog.warning({
      title: '删除确认',
      content: '删除后不可恢复，确定继续吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await deleteByIds(ids, adjustPage)
      },
    })
  }

  const deleteRow = (row: SysUserData) => {
    if (row?.id) {
      void deleteByIds([row.id], true)
    }
  }

  const deleteBatch = () => {
    confirmDelete(checkedRowKeys.value)
  }

  return {
    ...{
      searchFormModel,
      pageNo,
      pageSize,
      pages,
      total,
      records,
      tableLoading,
      checkedRowKeys,
      page,
      search,
      resetSearch,
      pageChange,
      pageSizeChange,
    },
    ...{
      drawerVisible,
      drawerLoading,
      submitLoading,
      drawerMode,
      drawerTitle,
      drawerFormRef,
      drawerFormModel,
      openCreateDrawer,
      openEditDrawer,
      closeDrawer,
      handleDrawerAfterLeave,
      submitDrawer,
    },
    ...{
      deleteLoading,
      deleteRow,
      deleteBatch,
    },
  }
}

export type UserUpsertModel = SysUserParam
export default useCrud

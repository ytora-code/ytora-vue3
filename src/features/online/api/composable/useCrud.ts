import { ref, type Ref } from 'vue'
import { createDiscreteApi } from 'naive-ui'

import type SysDynamicApiData from '../type/SysDynamicApiData'
import type SysDynamicApiParam from '../type/SysDynamicApiParam'
import sysDynamicApiApi from '../api/SysDynamicApiApi'

interface DrawerFormInstance {
  validate: () => Promise<void>
}

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): SysDynamicApiParam => ({})

/**
 * 初始化抽屉的表单model
 */
const createInitialDrawerFormModel = (): SysDynamicApiParam => ({
  groupId: '',
  uri: '',
  method: undefined,
  name: '',
  type: '',
  content: '',
  testParam: '{\n  \n}',
  resultDesc: '',
  transactional: false,
  max: 200,
  status: 1,
})

/**
 * 增删改查
 */
const useCrud = (options?: {
  currentGroupId?: Ref<string>
}) => {
  const { message, dialog } = createDiscreteApi(['message', 'dialog'])
  const resolveCurrentGroupId = () => options?.currentGroupId?.value?.trim() || ''

  const searchFormModel = ref<SysDynamicApiParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<SysDynamicApiData[]>([])
  const tableLoading = ref<boolean>(false)
  const checkedRowKeys = ref<Array<string | number>>([])

  const page = async () => {
    const currentGroupId = resolveCurrentGroupId()
    if (!currentGroupId) {
      total.value = 0
      pages.value = 0
      records.value = []
      checkedRowKeys.value = []
      return
    }

    tableLoading.value = true
    try {
      const result = await sysDynamicApiApi.page({
        ...searchFormModel.value,
        groupId: currentGroupId,
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

  const drawerVisible = ref<boolean>(false)
  const drawerLoading = ref<boolean>(false)
  const submitLoading = ref<boolean>(false)
  const drawerMode = ref<'create' | 'edit'>('create')
  const drawerFormRef = ref<DrawerFormInstance | null>(null)
  const drawerFormModel = ref<SysDynamicApiParam>(createInitialDrawerFormModel())
  const drawerTitle = ref('新增')

  const openCreateDrawer = () => {
    const currentGroupId = resolveCurrentGroupId()
    if (!currentGroupId) {
      message.warning('请先选择所属分组')
      return
    }

    drawerMode.value = 'create'
    drawerTitle.value = '新增'
    drawerFormModel.value = {
      ...createInitialDrawerFormModel(),
      groupId: currentGroupId,
    }
    drawerVisible.value = true
  }

  const openEditDrawer = async (id?: string | number) => {
    if (!id) {
      message.error('缺少ID，无法编辑')
      return
    }

    drawerMode.value = 'edit'
    drawerTitle.value = '编辑'
    drawerVisible.value = true
    drawerLoading.value = true
    drawerFormModel.value = createInitialDrawerFormModel()

    try {
      const result = await sysDynamicApiApi.queryById(id)
      drawerFormModel.value = {
        ...createInitialDrawerFormModel(),
        ...result,
      } as SysDynamicApiParam
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
    drawerTitle.value = '新增'
    drawerFormModel.value = createInitialDrawerFormModel()
  }

  const submitDrawer = async () => {
    submitLoading.value = true

    try {
      await sysDynamicApiApi.upsert({
        ...drawerFormModel.value,
      } as SysDynamicApiParam)
      drawerVisible.value = false
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      submitLoading.value = false
    }
  }

  const deleteLoading = ref<boolean>(false)
  const publishLoadingId = ref<string>('')
  const offlineLoadingId = ref<string>('')

  const deleteByIds = async (ids: Array<string | number>, adjustPage = false) => {
    deleteLoading.value = true

    try {
      await sysDynamicApiApi.deleteByIds(ids)

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

  const deleteRow = (row: SysDynamicApiData) => {
    if (row?.id) {
      void deleteByIds([row.id], true)
    }
  }

  const deleteBatch = () => {
    confirmDelete(checkedRowKeys.value)
  }

  const publishRow = async (row: SysDynamicApiData) => {
    if (!row?.id) {
      message.warning('缺少ID，无法上线')
      return
    }

    publishLoadingId.value = String(row.id)
    try {
      await sysDynamicApiApi.publish(String(row.id))
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      publishLoadingId.value = ''
    }
  }

  const offlineRow = async (row: SysDynamicApiData) => {
    if (!row?.id) {
      message.warning('缺少ID，无法下线')
      return
    }

    offlineLoadingId.value = String(row.id)
    try {
      await sysDynamicApiApi.offline(String(row.id))
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      offlineLoadingId.value = ''
    }
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
      publishLoadingId,
      offlineLoadingId,
      deleteRow,
      deleteBatch,
      publishRow,
      offlineRow,
    },
  }
}

export type SysDynamicApiUpsertModel = SysDynamicApiParam
export default useCrud

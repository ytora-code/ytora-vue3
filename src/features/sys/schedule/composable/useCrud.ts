import { computed, ref } from 'vue'
import { dialog, message } from '@/utils/naiveApi'

import type SysSchedulerTaskData from '../type/SysSchedulerTaskData'
import type SysSchedulerTaskParam from '../type/SysSchedulerTaskParam'
import sysSchedulerTaskApi from '../api/SysSchedulerTaskApi'

interface DrawerFormInstance {
  validate: () => Promise<void>
}

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): SysSchedulerTaskParam => ({})

/**
 * 初始化抽屉的表单model
 */
const createInitialDrawerFormModel = (): SysSchedulerTaskParam => ({
  timeWheelTaskId: '',
  taskName: '',
  taskCode: '',
  cron: '',
  type: undefined,
  params: '',
  status: 1,
})

/**
 * 增删改查
 */
const useCrud = () => {
  const searchFormModel = ref<SysSchedulerTaskParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<SysSchedulerTaskData[]>([])
  const tableLoading = ref<boolean>(false)
  const checkedRowKeys = ref<Array<string | number>>([])

  const page = async () => {
    tableLoading.value = true
    try {
      const result = await sysSchedulerTaskApi.page({
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
  const drawerFormModel = ref<SysSchedulerTaskParam>(createInitialDrawerFormModel())
  const drawerTitle = computed(() =>
    drawerMode.value === 'create' ? '新增调度任务' : '编辑调度任务',
  )

  const openCreateDrawer = () => {
    drawerMode.value = 'create'
    drawerFormModel.value = createInitialDrawerFormModel()
    drawerVisible.value = true
  }

  const openEditDrawer = async (id?: string | number) => {
    if (!id) {
      message.error('缺少ID，无法编辑')
      return
    }

    drawerMode.value = 'edit'
    drawerVisible.value = true
    drawerLoading.value = true
    drawerFormModel.value = createInitialDrawerFormModel()

    try {
      const result = await sysSchedulerTaskApi.queryById(id)
      drawerFormModel.value = {
        ...createInitialDrawerFormModel(),
        ...result,
      } as SysSchedulerTaskParam
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
      await sysSchedulerTaskApi.upsert({
        ...drawerFormModel.value,
      } as SysSchedulerTaskParam)
      drawerVisible.value = false
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      submitLoading.value = false
    }
  }

  const deleteLoading = ref<boolean>(false)

  const deleteByIds = async (ids: Array<string | number>, adjustPage = false) => {
    deleteLoading.value = true

    try {
      await sysSchedulerTaskApi.deleteByIds(ids)

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

  const deleteRow = (row: SysSchedulerTaskData) => {
    if (row?.id) {
      void deleteByIds([row.id], true)
    }
  }

  const deleteBatch = () => {
    confirmDelete(checkedRowKeys.value)
  }

  const actionLoadingId = ref<string | number | null>(null)

  const runTaskAction = async (row: SysSchedulerTaskData, action: 'runOnce' | 'start' | 'stop') => {
    if (!row?.id) {
      message.warning('缺少任务ID，无法执行操作')
      return
    }

    actionLoadingId.value = row.id

    try {
      if (action === 'runOnce') {
        await sysSchedulerTaskApi.runOnce(row.id)
      } else if (action === 'start') {
        await sysSchedulerTaskApi.start(row.id)
      } else {
        await sysSchedulerTaskApi.stop(row.id)
      }

      await page()
    } catch (error) {
      console.error(error)
    } finally {
      actionLoadingId.value = null
    }
  }

  const handleMoreAction = async (
    row: SysSchedulerTaskData,
    action: 'runOnce' | 'start' | 'stop',
  ) => {
    const actionTextMap = {
      log: '查询日志',
      runOnce: '执行一次',
      start: '启动',
      stop: '关闭',
    } as const

    dialog.warning({
      title: '操作确认',
      content: `确定要对任务“${row.taskName || row.taskCode || row.id}”执行“${actionTextMap[action]}”吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await runTaskAction(row, action)
      },
    })
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
      actionLoadingId,
      handleMoreAction,
    },
  }
}

export type SysSchedulerTaskUpsertModel = SysSchedulerTaskParam
export default useCrud

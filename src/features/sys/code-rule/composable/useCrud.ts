import { computed, ref } from 'vue'
import { createDiscreteApi } from 'naive-ui'

import type SysCodeRuleData from '../type/SysCodeRuleData'
import type SysCodeRuleParam from '../type/SysCodeRuleParam'
import sysCodeRuleApi from '../api/SysCodeRuleApi'

interface DrawerFormInstance {
  validate: () => Promise<void>
}

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): SysCodeRuleParam => ({})

/**
 * 初始化抽屉的表单model
 */
const createInitialDrawerFormModel = (): SysCodeRuleParam => ({
  ruleCode: '',
  ruleName: '',
  ruleTemplate: '',
  seqStart: undefined,
  seqStep: undefined,
  timezone: '',
})

/**
 * 增删改查
 */
const useCrud = () => {
  const { message, dialog } = createDiscreteApi(['message', 'dialog'])

  const searchFormModel = ref<SysCodeRuleParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<SysCodeRuleData[]>([])
  const tableLoading = ref<boolean>(false)
  const checkedRowKeys = ref<Array<string | number>>([])

  const page = async () => {
    tableLoading.value = true
    try {
      const result = await sysCodeRuleApi.page({
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
  const drawerFormModel = ref<SysCodeRuleParam>(createInitialDrawerFormModel())
  const drawerTitle = computed(() =>
    drawerMode.value === 'create' ? '新增系统编码规则' : '编辑系统编码规则',
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
      const result = await sysCodeRuleApi.queryById(id)
      drawerFormModel.value = {
        ...createInitialDrawerFormModel(),
        ...result,
      } as SysCodeRuleParam
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
      await sysCodeRuleApi.upsert({
        ...drawerFormModel.value,
      } as SysCodeRuleParam)
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
      await sysCodeRuleApi.deleteByIds(ids)

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

  const deleteRow = (row: SysCodeRuleData) => {
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

export type SysCodeRuleUpsertModel = SysCodeRuleParam
export default useCrud

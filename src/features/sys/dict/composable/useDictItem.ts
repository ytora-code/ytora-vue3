import { computed, ref } from 'vue'
import { dialog, message } from '@/utils/naiveApi'

import sysDictItemApi from '../api/SysDictItemApi'
import type PageParam from '@/types/PageParam'
import type SysDictData from '../type/SysDictData'
import type SysDictItemData from '../type/SysDictItemData'
import type SysDictItemParam from '../type/SysDictItemParam'

interface DrawerFormInstance {
  validate: () => Promise<void>
}

const createInitialDrawerFormModel = (dictCode = ''): SysDictItemParam => ({
  dictCode,
  itemValue: '',
  itemText: '',
  color: '',
  index: undefined,
  remark: '',
})

const createInitialSearchFormModel = (dictCode = ''): SysDictItemParam => ({
  dictCode,
  itemText: '',
})

const useDictItem = () => {
  const currentDict = ref<SysDictData | null>(null)
  const itemDrawerVisible = ref(false)
  const itemDrawerLoading = ref(false)
  const itemSearchFormModel = ref<SysDictItemParam>(createInitialSearchFormModel())
  const itemPageNo = ref(1)
  const itemPageSize = ref(10)
  const itemPages = ref<number>()
  const itemTotal = ref<number>()
  const itemRecords = ref<SysDictItemData[]>([])
  const itemCheckedRowKeys = ref<Array<string | number>>([])

  const itemFormDrawerVisible = ref(false)
  const itemFormDrawerLoading = ref(false)
  const itemSubmitLoading = ref(false)
  const itemFormMode = ref<'create' | 'edit'>('create')
  const itemFormRef = ref<DrawerFormInstance | null>(null)
  const itemFormModel = ref<SysDictItemParam>(createInitialDrawerFormModel())

  const currentDictCode = computed(() => currentDict.value?.dictCode || '')
  const itemDrawerTitle = computed(() => {
    if (!currentDict.value) {
      return '-'
    }

    return `${currentDict.value.dictName}(${currentDict.value.dictCode})`
  })
  const itemFormDrawerTitle = computed(() =>
    itemFormMode.value === 'create' ? '新增字典项' : '编辑字典项',
  )

  const loadDictItems = async () => {
    if (!currentDictCode.value) {
      itemSearchFormModel.value = createInitialSearchFormModel()
      itemPageNo.value = 1
      itemPageSize.value = 10
      itemPages.value = 0
      itemTotal.value = 0
      itemRecords.value = []
      itemCheckedRowKeys.value = []
      return
    }

    itemDrawerLoading.value = true
    try {
      const result = await sysDictItemApi.page({
        ...(itemSearchFormModel.value as SysDictItemParam & PageParam),
        dictCode: currentDictCode.value,
        pageNo: itemPageNo.value,
        pageSize: itemPageSize.value,
      })
      itemPageNo.value = result.pageNo
      itemPageSize.value = result.pageSize
      itemPages.value = result.pages
      itemTotal.value = result.total
      itemRecords.value = result.records
      itemCheckedRowKeys.value = itemCheckedRowKeys.value.filter((key) =>
        result.records.some((item) => String(item.id) === String(key)),
      )
    } catch (error) {
      console.error(error)
    } finally {
      itemDrawerLoading.value = false
    }
  }

  const openDictItemDrawer = async (dict: SysDictData) => {
    if (!dict?.dictCode) {
      message.warning('当前字典缺少字典编码，无法管理字典项')
      return
    }

    currentDict.value = dict
    itemDrawerVisible.value = true
    itemSearchFormModel.value = createInitialSearchFormModel(dict.dictCode)
    itemPageNo.value = 1
    itemPageSize.value = 10
    itemCheckedRowKeys.value = []
    await loadDictItems()
  }

  const closeDictItemDrawer = () => {
    itemDrawerVisible.value = false
  }

  const handleItemDrawerAfterLeave = () => {
    currentDict.value = null
    itemDrawerLoading.value = false
    itemSearchFormModel.value = createInitialSearchFormModel()
    itemPageNo.value = 1
    itemPageSize.value = 10
    itemPages.value = 0
    itemTotal.value = 0
    itemRecords.value = []
    itemCheckedRowKeys.value = []
    itemFormDrawerVisible.value = false
    itemFormDrawerLoading.value = false
    itemSubmitLoading.value = false
    itemFormMode.value = 'create'
    itemFormModel.value = createInitialDrawerFormModel()
  }

  const searchDictItems = async () => {
    itemPageNo.value = 1
    await loadDictItems()
  }

  const resetDictItemSearch = async () => {
    itemSearchFormModel.value = createInitialSearchFormModel(currentDictCode.value)
    itemPageNo.value = 1
    await loadDictItems()
  }

  const itemPageChange = async (pageNo: number) => {
    itemPageNo.value = pageNo
    await loadDictItems()
  }

  const itemPageSizeChange = async (pageSize: number) => {
    itemPageNo.value = 1
    itemPageSize.value = pageSize
    await loadDictItems()
  }

  const openCreateDictItemDrawer = () => {
    if (!currentDictCode.value) {
      message.warning('缺少字典编码，无法新增字典项')
      return
    }

    itemFormMode.value = 'create'
    itemFormModel.value = createInitialDrawerFormModel(currentDictCode.value)
    itemFormDrawerVisible.value = true
  }

  const openEditDictItemDrawer = async (id?: string | number) => {
    if (!id) {
      message.error('缺少ID，无法编辑字典项')
      return
    }

    itemFormMode.value = 'edit'
    itemFormDrawerVisible.value = true
    itemFormDrawerLoading.value = true
    itemFormModel.value = createInitialDrawerFormModel(currentDictCode.value)

    try {
      const result = await sysDictItemApi.queryById(id)
      itemFormModel.value = {
        ...createInitialDrawerFormModel(currentDictCode.value),
        ...result,
        dictCode: result.dictCode || currentDictCode.value,
      } as SysDictItemParam
    } catch (error) {
      console.error(error)
      itemFormDrawerVisible.value = false
    } finally {
      itemFormDrawerLoading.value = false
    }
  }

  const closeItemFormDrawer = () => {
    itemFormDrawerVisible.value = false
  }

  const handleItemFormDrawerAfterLeave = () => {
    itemFormDrawerLoading.value = false
    itemSubmitLoading.value = false
    itemFormMode.value = 'create'
    itemFormModel.value = createInitialDrawerFormModel(currentDictCode.value)
  }

  const submitItemDrawer = async () => {
    if (!currentDictCode.value) {
      message.warning('缺少字典编码，无法保存字典项')
      return
    }

    await itemFormRef.value?.validate()
    itemSubmitLoading.value = true

    try {
      await sysDictItemApi.upsert({
        ...itemFormModel.value,
        dictCode: currentDictCode.value,
      } as SysDictItemParam)
      itemFormDrawerVisible.value = false
      await loadDictItems()
    } catch (error) {
      console.error(error)
    } finally {
      itemSubmitLoading.value = false
    }
  }

  const deleteItemLoading = ref(false)

  const deleteDictItemsByIds = async (ids: Array<string | number>, adjustPage = false) => {
    deleteItemLoading.value = true

    try {
      await sysDictItemApi.deleteByIds(ids)

      if (adjustPage && itemRecords.value.length === ids.length && itemPageNo.value > 1) {
        itemPageNo.value -= 1
      }

      const deletingKeys = new Set(ids.map((item) => String(item)))
      itemCheckedRowKeys.value = itemCheckedRowKeys.value.filter(
        (key) => !deletingKeys.has(String(key)),
      )
      await loadDictItems()
    } catch (error) {
      console.error(error)
    } finally {
      deleteItemLoading.value = false
    }
  }

  const confirmDeleteDictItems = (ids: Array<string | number>, adjustPage = false) => {
    if (!ids.length) {
      message.warning('请先选择要删除的字典项')
      return
    }

    dialog.warning({
      title: '删除确认',
      content: '删除后不可恢复，确定继续吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await deleteDictItemsByIds(ids, adjustPage)
      },
    })
  }

  const deleteDictItemRow = (row: SysDictItemData) => {
    if (row?.id) {
      void deleteDictItemsByIds([row.id], true)
    }
  }

  const deleteDictItemBatch = () => {
    confirmDeleteDictItems(itemCheckedRowKeys.value)
  }

  return {
    itemCheckedRowKeys,
    itemDrawerLoading,
    itemDrawerTitle,
    itemDrawerVisible,
    itemPageNo,
    itemPageSize,
    itemPages,
    itemSearchFormModel,
    itemTotal,
    itemFormDrawerLoading,
    itemFormDrawerTitle,
    itemFormDrawerVisible,
    itemFormModel,
    itemFormRef,
    itemRecords,
    itemSubmitLoading,
    deleteItemLoading,
    openDictItemDrawer,
    closeDictItemDrawer,
    handleItemDrawerAfterLeave,
    searchDictItems,
    resetDictItemSearch,
    itemPageChange,
    itemPageSizeChange,
    openCreateDictItemDrawer,
    openEditDictItemDrawer,
    closeItemFormDrawer,
    handleItemFormDrawerAfterLeave,
    submitItemDrawer,
    deleteDictItemRow,
    deleteDictItemBatch,
  }
}

export default useDictItem

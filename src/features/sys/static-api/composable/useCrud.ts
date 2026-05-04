import { ref } from 'vue'

import sysStaticApi from '../api/SysStaticApi'
import type SysStaticApiData from '../type/SysStaticApiData'
import type SysStaticApiParam from '../type/SysStaticApiParam'

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): SysStaticApiParam => ({})

/**
 * 只读分页查询
 */
const useCrud = () => {
  const searchFormModel = ref<SysStaticApiParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<SysStaticApiData[]>([])
  const tableLoading = ref<boolean>(false)

  const page = async () => {
    tableLoading.value = true
    try {
      const result = await sysStaticApi.page({
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

  return {
    searchFormModel,
    pageNo,
    pageSize,
    pages,
    total,
    records,
    tableLoading,
    page,
    search,
    resetSearch,
    pageChange,
    pageSizeChange,
  }
}

export default useCrud

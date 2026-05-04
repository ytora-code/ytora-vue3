import { ref } from 'vue'
import { dialog, message } from '@/utils/naiveApi'

import sysOnlineUserApi from '../api/SysOnlineUserApi'
import type OnlineUserData from '../type/OnlineUserData'
import type OnlineUserParam from '../type/OnlineUserParam'

/**
 * 初始化搜索框的表单model
 */
const createInitialSearchFormModel = (): OnlineUserParam => ({})

/**
 * 在线用户查询与踢下线
 */
const useCrud = () => {
  const searchFormModel = ref<OnlineUserParam>(createInitialSearchFormModel())
  const pageNo = ref<number>(1)
  const pageSize = ref<number>(10)
  const pages = ref<number>()
  const total = ref<number>()
  const records = ref<OnlineUserData[]>([])
  const tableLoading = ref<boolean>(false)
  const checkedRowKeys = ref<Array<string | number>>([])

  const page = async () => {
    tableLoading.value = true
    try {
      const result = await sysOnlineUserApi.page({
        ...searchFormModel.value,
        pageNo: pageNo.value,
        pageSize: pageSize.value,
      })
      pageNo.value = result.pageNo
      pageSize.value = result.pageSize
      pages.value = result.pages
      total.value = result.total
      records.value = result.records
      checkedRowKeys.value = checkedRowKeys.value.filter((key) =>
        result.records.some((item) => (item.token || item.id) === key),
      )
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

  const kickLoading = ref<boolean>(false)

  const kickByTokens = async (tokens: string[], adjustPage = false) => {
    if (!tokens.length) {
      message.warning('请先选择要踢下线的在线用户')
      return
    }

    kickLoading.value = true
    try {
      await sysOnlineUserApi.kickByTokens(tokens.join(','))

      if (adjustPage && records.value.length === tokens.length && pageNo.value > 1) {
        pageNo.value -= 1
      }

      const tokenSet = new Set(tokens)
      checkedRowKeys.value = checkedRowKeys.value.filter((key) => !tokenSet.has(String(key)))
      await page()
    } catch (error) {
      console.error(error)
    } finally {
      kickLoading.value = false
    }
  }

  const confirmKick = (tokens: string[], adjustPage = false) => {
    if (!tokens.length) {
      message.warning('请先选择要踢下线的在线用户')
      return
    }

    dialog.warning({
      title: '踢下线确认',
      content: '目标用户会被立即强制下线，确定继续吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        await kickByTokens(tokens, adjustPage)
      },
    })
  }

  const kickRow = (row: OnlineUserData) => {
    if (row?.token) {
      confirmKick([row.token], true)
      return
    }

    message.warning('当前在线用户缺少token，无法踢下线')
  }

  const kickBatch = () => {
    confirmKick(checkedRowKeys.value.map((item) => String(item)))
  }

  return {
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
    kickLoading,
    kickRow,
    kickBatch,
  }
}

export default useCrud

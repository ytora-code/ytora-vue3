import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SelectOption } from 'naive-ui'
import { dictApi } from '@/views/sys/dict/api/DictApi.ts'

/**
 * 字典缓存
 */
export const useDictCache = defineStore('dictCache', () => {
  /**
   * 字典缓存
   */
  const dictMap = ref<Record<string, SelectOption[]>>({})

  const getDict = async (dictCode: string) => {
    if (!dictCode) {
      return []
    }
    // 已有缓存，则直接使用缓存
    if (dictMap.value[dictCode]) {
      return dictMap.value[dictCode]
    }
    // 请求字典数据
    const dictItems = await listDictItem(dictCode)
    const options = dictItems.map((item) => ({
      label: item.dictItemText,
      value: toNumberIfPossible(item.dictItemValue),
    }))
    dictMap.value[dictCode] = options
    return options
  }

  /**
   * 查询字典项
   */
  const listDictItem = async (dictCode: string) => {
    return await dictApi.listDictItem(dictCode)
  }

  const toNumberIfPossible = (value?: string) => {
    if (!value) {
      return value
    }
    // 走到这，一定是字符串
    // 排除空字符串和纯空白
    if (value.trim() === '') {
      return value
    }

    const num = Number(value)

    // 能够转为数字
    if (Number.isFinite(num)) {
      return num
    }

    return value
  }

  return { getDict, listDictItem }
})

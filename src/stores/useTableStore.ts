import { defineStore } from 'pinia'
import tableSchemaApi from '@/features/rbac/permission/api/SysTableSchemaApi'
import SysTableSchemaData from '@/features/rbac/permission/type/SysTableSchemaData'

/**
 * table缓存
 */
export default defineStore('tableStore', () => {
  /**
   * table缓存
   */
  const schemaCache = ref<Record<string, SysTableSchemaData[]>>({})

  const getTableSchema = async (tableCode: string) => {
    if (!tableCode) {
      return []
    }
    // 已有缓存，则直接使用缓存
    if (schemaCache.value[tableCode]) {
      return schemaCache.value[tableCode]
    }
    // 请求字典数据
    const tableSchemas = await listSchemas(tableCode)

    schemaCache.value[tableCode] = tableSchemas
    return tableSchemas
  }

  /**
   * 查询表格列Schema
   */
  const listSchemas = async (dictCode: string) => {
    return await tableSchemaApi.listSchemasByTableCode(dictCode)
  }

  return { getTableSchema, listSchemas }
})

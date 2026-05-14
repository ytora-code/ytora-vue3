import { defineStore } from 'pinia'
import SysFormSchemaData from "@/features/rbac/permission/type/SysFormSchemaData";
import formSchemaApi from "@/features/rbac/permission/api/SysFormSchemaApi";

/**
 * form缓存
 */
export default defineStore('formStore', () => {
  /**
   * form缓存
   */
  const schemaCache = ref<Record<string, SysFormSchemaData[]>>({})

  const getFormSchema = async (formCode: string) => {
    if (!formCode) {
      return []
    }
    // 已有缓存，则直接使用缓存
    if (schemaCache.value[formCode]) {
      return schemaCache.value[formCode]
    }
    // 请求字典数据
    const formSchemas = await listSchemas(formCode)

    schemaCache.value[formCode] = formSchemas
    return formSchemas
  }

  /**
   * 查询表格列Schema
   */
  const listSchemas = async (formCode: string) => {
    return await formSchemaApi.listSchemasByFormCode(formCode)
  }

  return { getFormSchema, listSchemas }
})

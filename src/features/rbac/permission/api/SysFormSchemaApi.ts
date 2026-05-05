import BaseApi from '@/api/BaseApi'
import type PageParam from '@/types/PageParam'
import type SysFormSchemaData from '../type/SysFormSchemaData'
import type SysFormSchemaParam from '../type/SysFormSchemaParam'
import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

class SysFormSchemaApi extends BaseApi {
  constructor() {
    super('/sys/form-schema')
  }

  // ============================== CRUD =================================>

  /**
   * 列表查询指定资源下的表单
   */
  listForms = (permissionId: string) => {
    return this.get<Array<SysPermissionData>, { permissionId: string }>('listForms', {
      permissionId,
    })
  }

  /**
   * 列表查询表单的表单项Schema数据
   */
  listSchemas = (params: SysFormSchemaParam & PageParam) => {
    return this.get<Array<SysFormSchemaData>, SysFormSchemaParam & PageParam>('listSchemas', params)
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysFormSchemaData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysFormSchemaParam) => {
    return this.post<unknown, SysFormSchemaParam>('upsert', data)
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', { ids: ids.join(',') })
  }

  // ============================== 其他 =================================>
}

export default new SysFormSchemaApi()

import BaseApi from '@/api/BaseApi'
import type PageParam from '@/types/PageParam'
import type SysFormSchemaData from '../type/SysFormSchemaData'
import type SysFormSchemaParam from '../type/SysFormSchemaParam'
import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import PageData from "@/types/PageData";
import SysRoleFormSchemaParam from "@/features/rbac/permission/type/SysRoleFormSchemaParam";

class SysFormSchemaApi extends BaseApi {
  constructor() {
    super('/sys/form-schema')
  }

  // ============================== CRUD =================================>

  /**
   * 分页查询指定资源下的表单
   */
  pageForms = (params: SysFormSchemaParam & PageParam) => {
    return this.get<PageData<SysPermissionData>, SysFormSchemaParam & PageParam>('pageForms', params)
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

  /**
   * 查询指定角色在指定资源下拥有的表单
   */
  listFormsForRole = (roleId: string, permissionId: string) =>
    this.get<PageData<SysPermissionData>, { roleId: string, permissionId: string }>('listFormsForRole', { roleId, permissionId })

  /**
   * 更新指定角色在指定资源下拥有的表单
   */
  refreshFormsForRole = (param: SysRoleFormSchemaParam) =>
    this.post<PageData<SysPermissionData>, SysRoleFormSchemaParam>('refreshFormsForRole', param)

  /**
   * 查询指定角色在指定表单下拥有的表单项字段
   */
  listSchemasForRole = (roleId: string, formId: string) =>
    this.get<PageData<SysPermissionData>, { roleId: string, formId: string }>('listSchemasForRole', { roleId, formId })

  /**
   * 更新指定角色在指定表单下拥有的表单项字段
   */
  refreshSchemasForRole = (param: SysRoleFormSchemaParam) =>
    this.post<PageData<SysPermissionData>, SysRoleFormSchemaParam>('refreshSchemasForRole', param)

}

export default new SysFormSchemaApi()

import BaseApi from '@/api/BaseApi'
import type SysTableSchemaData from '../type/SysTableSchemaData'
import type SysTableSchemaParam from '../type/SysTableSchemaParam'
import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'
import type PageData from "@/types/PageData";
import PageParam from "@/types/PageParam";
import SysRoleTableSchemaParam from "@/features/rbac/permission/type/SysRoleTableSchemaParam";

class SysTableSchemaApi extends BaseApi {
  constructor() {
    super('/sys/table-schema')
  }

  // ============================== CRUD =================================>

  /**
   * 分页查询指定资源下的表格
   */
  pageTables = (param: SysTableSchemaParam & PageParam) => {
    return this.get<PageData<SysPermissionData>, SysTableSchemaParam & PageParam>('pageTables', param)
  }

  /**
   * 列表查询数据表格列Schema数据
   */
  listSchemas = (params: SysTableSchemaParam) => {
    return this.get<Array<SysTableSchemaData>, SysTableSchemaParam>('listSchemas', params)
  }

  /**
   * 根据表格code查询数据表格列Schema数据
   */
  listSchemasByTableCode = (tableCode: string) => {
    return this.get<Array<SysTableSchemaData>, { tableCode: string }>('listSchemasByTableCode', {
      tableCode,
    })
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysTableSchemaData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysTableSchemaParam) => {
    return this.post<unknown, SysTableSchemaParam>('upsert', data)
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

  // ============================== EXCEL导入导出 =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入数据
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出数据
   */
  export = (params: SysTableSchemaParam) => {
    return this.download<SysTableSchemaParam>('export', params)
  }

  // ============================== 其他 =================================>

  /**
   * 查询指定角色在指定资源下拥有的表格
   */
  listTablesForRole = (roleId: string, permissionId: string) =>
    this.get<PageData<SysPermissionData>, { roleId: string, permissionId: string }>('listTablesForRole', { roleId, permissionId })

  /**
   * 更新指定角色在指定资源下拥有的表格
   */
  refreshTablesForRole = (param: SysRoleTableSchemaParam) =>
    this.post<PageData<SysPermissionData>, SysRoleTableSchemaParam>('refreshTablesForRole', param)

  /**
   * 查询指定角色在指定表格下拥有的表格列字段
   */
  listSchemasForRole = (roleId: string, tableId: string) =>
    this.get<PageData<SysPermissionData>, { roleId: string, tableId: string }>('listSchemasForRole', { roleId, tableId })

  /**
   * 更新指定角色在指定表格下拥有的表格列字段
   */
  refreshSchemasForRole = (param: SysRoleTableSchemaParam) =>
    this.post<PageData<SysPermissionData>, SysRoleTableSchemaParam>('refreshSchemasForRole', param)

}

export default new SysTableSchemaApi()

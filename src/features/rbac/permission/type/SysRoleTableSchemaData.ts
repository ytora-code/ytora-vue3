import type BaseData from '@/types/BaseData'

/**
 * 角色-表字段关系响应数据
 */
export default interface SysRoleTableSchemaData extends BaseData {

  /**
   * 角色ID
   */
  roleId?: number

  /**
   * 表格的资源ID
   */
  tableId?: number

  /**
   * 表格列ID
   */
  schemaId?: number

}

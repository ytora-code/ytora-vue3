import type BaseParam from '@/types/BaseParam'

/**
 * 角色-表字段关系请求参数
 */
export default interface SysRoleTableSchemaParam extends BaseParam {

  /**
   * 角色ID
   */
  roleId?: number

  /**
   * 所属的资源ID
   */
  permissionId?: number

  /**
   * 表格的资源ID
   */
  tableId?: number

  /**
   * 最新的ID数组
   */
  ids?: Array<string>

}

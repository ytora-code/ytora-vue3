import type BaseParam from '@/types/BaseParam'

/**
 * 角色-表单项关系请求参数
 */
export default interface SysRoleFormSchemaParam extends BaseParam {

  /**
   * 角色ID
   */
  roleId?: number

  /**
   * 所属的资源ID
   */
  permissionId?: number

  /**
   * 表单的资源ID
   */
  formId?: number

  /**
   * 最新的ID数组
   */
  ids?: Array<string>

}

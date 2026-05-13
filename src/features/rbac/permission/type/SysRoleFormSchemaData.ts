import type BaseData from '@/types/BaseData'

/**
 * 角色-表单项关系响应数据
 */
export default interface SysRoleFormSchemaData extends BaseData {

  /**
   * 角色ID
   */
  roleId?: number

  /**
   * 表单的资源ID
   */
  formId?: number

  /**
   * 表单项ID
   */
  schemaId?: number

}

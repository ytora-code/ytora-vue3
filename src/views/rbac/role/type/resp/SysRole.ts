import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * 角色的实体类型
 */
export default interface SysRole extends BaseResp {
  /**
   * 角色名称
   */
  roleName: string
  /**
   * 角色编码
   */
  roleCode?: string
  /**
   * 角色所属部门，该字段为空表示该角色是系统角色，否则是部门角色
   */
  roleDepartCode: string
}

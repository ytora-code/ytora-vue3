import BaseParam from '@/types/BaseParam'

/**
 * created by YT on 2025/12/25 下午10:34
 */
export default interface SysUserRoleRefreshParam extends BaseParam {
  /**
   * 用户ID
   */
  userId?: string

  /**
   * 角色ID
   */
  roleId?: string

  /**
   * 是否新增，true是新增，false是移除
   */
  add: boolean
}

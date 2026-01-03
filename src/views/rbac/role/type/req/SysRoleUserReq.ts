import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * created by YT on 2025/12/25 下午10:34
 */
export default interface SysRoleUserReq extends BaseReq {
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

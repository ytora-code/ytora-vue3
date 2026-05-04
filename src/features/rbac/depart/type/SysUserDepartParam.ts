import BaseParam from '@/types/BaseParam'

/**
 * 用户-部门请求参数
 */
export default interface SysUserDepartParam extends BaseParam {
  /**
   * 用户ID
   */
  userIds: string[]

  /**
   * 部门ID数组
   */
  departId: string

  /**
   * 操作类型，add是绑定用户-部门关系，delete是解绑用户-部门关系
   */
  type: string
}

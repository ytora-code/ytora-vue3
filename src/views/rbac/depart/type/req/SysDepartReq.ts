import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * created by YT on 2025/12/25 下午10:34
 */
export default interface SysUserReq extends BaseReq {
  /**
   * 上级部门id
   */
  pid?: string
  /**
   * 部门名称
   */
  departName?: string
  /**
   * 部门编码
   */
  departCode?: string
  /**
   * 部门类型
   */
  type?: string
  /**
   * 部门联系人username
   */
  contactUserName?: string
}

import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * created by YT on 2025/12/25 下午10:34
 */
export default interface SysUserReq extends BaseReq {
  /**
   * 用户名
   */
  userName?: string
  /**
   * 真实姓名
   */
  realName?: string
  /**
   * 头像
   */
  avatar?: string
  /**
   * 电话
   */
  phone?: string
  /**
   * 邮箱
   */
  email?: string

  /**
   * 生日
   */
  birthday?: string

  /**
   * 证件号
   */
  idCard?: string

  /**
   * 状态
   */
  status?: boolean
}

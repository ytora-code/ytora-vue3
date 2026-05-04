import BaseData from '@/types/BaseData'

/**
 * 用户模块响应数据
 */
export default interface SysUserData extends BaseData {
  /**
   * 用户名
   */
  userName?: string
  /**
   * 真实姓名
   */
  realName?: string
  /**
   * 密码
   */
  password?: string
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
  status?: number
}

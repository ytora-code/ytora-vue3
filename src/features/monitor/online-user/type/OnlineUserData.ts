import type BaseData from '@/types/BaseData'

/**
 * 在线用户响应数据
 */
export default interface OnlineUserData extends BaseData {
  /**
   * 用户名
   */
  userName?: string
  /**
   * 用户真实姓名
   */
  realName?: string
  /**
   * 用户部门编码
   */
  departCode?: string
  /**
   * 用户登录时间戳
   */
  loginTime?: number
  /**
   * 用户上一次请求时间戳
   */
  lastRequestTime?: number
  /**
   * 用户请求次数
   */
  requestCount?: number
  /**
   * 用户角色编码列表
   */
  ip?: string
  /**
   * 当前会话token
   */
  token?: string
}

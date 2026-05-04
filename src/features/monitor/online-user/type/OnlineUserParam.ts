import BaseParam from '@/types/BaseParam'

/**
 * 在线用户查询参数
 */
export default interface OnlineUserParam extends BaseParam {
  /**
   * 用户名
   */
  userName?: string

  /**
   * 真实姓名
   */
  realName?: string
}

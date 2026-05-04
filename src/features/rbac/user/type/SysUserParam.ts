import BaseParam from '@/types/BaseParam'

/**
 * 用户模块请求参数
 */
export default interface SysUserParam extends BaseParam {
  /**
   * 主键
   */
  id?: string
  /**
   * 用户名
   */
  userName?: string
  /**
   * 真实姓名
   */
  realName?: string

  /**
   * 部门
   */
  departCode?: string

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
   * 备注
   */
  remark?: string

  /**
   * 状态
   */
  status?: number
}

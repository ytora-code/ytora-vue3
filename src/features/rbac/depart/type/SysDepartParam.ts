import type BaseParam from '@/types/BaseParam'

/**
 * 部门请求参数
 */
export default interface SysDepartParam extends BaseParam {
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
   * 部门负责人用户ID
   */
  contactId?: string

  /**
   * 部门负责人名称，仅前端展示使用
   */
  contactUserName?: string
}

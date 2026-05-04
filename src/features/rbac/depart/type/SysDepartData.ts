import type BaseData from '@/types/BaseData'

/**
 * 部门响应数据
 */
export default interface SysDepartData extends BaseData {
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
   * 部门负责人用户
   */
  contactId_DICT: string

  /**
   * 子部门
   */
  children?: Array<SysDepartData>
}

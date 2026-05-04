import type BaseData from '@/types/BaseData'

/**
 * 回收站响应数据
 */
export default interface SysRecycleBinData extends BaseData {
  /**
   * 删除人
   */
  deletedBy?: string

  /**
   * 删除时间
   */
  deletedTime?: Date

  /**
   * 删除原因
   */
  deleteReason?: string

  /**
   * 原始表
   */
  originalTable?: string

  /**
   * 原始数据id
   */
  originalId?: string

  /**
   * 原始数据，JSON
   */
  originalData?: string

  /**
   * redo,还原SQL
   */
  restoreSql?: string
}

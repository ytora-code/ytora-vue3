import type BaseParam from '@/types/BaseParam'

/**
 * 回收站请求参数
 */
export default interface SysRecycleBinParam extends BaseParam {
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

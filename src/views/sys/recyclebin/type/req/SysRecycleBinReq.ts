import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * 回收站
 */
export default interface SysRecycleBinReq extends BaseReq {
  /**
   * 删除人
   */
  deletedBy?: string

  /**
   * 删除时间
   */
  deletedTime?: string

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

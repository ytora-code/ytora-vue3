import type BaseReq from '@/types/req/BaseReq.ts'

export default interface SysFileReq extends BaseReq {
  /**
   * 所属文件夹ID
   */
  folderId?: string
  /**
   * 文件夹名称
   */
  fileName?: string
}

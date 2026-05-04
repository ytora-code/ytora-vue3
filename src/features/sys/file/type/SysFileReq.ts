import BaseParam from '@/types/BaseParam'

export default interface SysFileReq extends BaseParam {
  /**
   * 所属文件夹ID
   */
  folderId?: string
  /**
   * 文件夹名称
   */
  fileName?: string
}

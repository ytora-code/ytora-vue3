import BaseParam from '@/types/BaseParam'

export default interface SysFolderReq extends BaseParam {
  /**
   * 父文件夹ID
   */
  pid?: string
  /**
   * 文件夹名称
   */
  path?: string
}

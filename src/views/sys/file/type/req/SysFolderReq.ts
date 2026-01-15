import type BaseReq from '@/types/req/BaseReq.ts'

export default interface SysFolderReq extends BaseReq {
  /**
   * 父文件夹ID
   */
  pid?: string
  /**
   * 文件夹名称
   */
  path?: string
}

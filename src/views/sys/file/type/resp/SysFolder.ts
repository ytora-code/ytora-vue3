import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysFolder extends BaseResp {
  /**
   * 父文件夹ID
   */
  pid?: string
  /**
   * 文件夹路径
   */
  path: string
  /**
   * 文件夹深度
   */
  depth: number

  children?: SysFolder[]
}

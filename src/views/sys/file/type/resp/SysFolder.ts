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
  depth?: number

  /**
   * 类型，1-文件夹/2-文件
   */
  type: number

  /**
   * 文件扩展
   */
  ext?: string

  /**
   * 子数据
   */
  children?: SysFolder[]
}

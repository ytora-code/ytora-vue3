import BaseData from '@/types/BaseData'

/**
 * 系统文件
 */
export default interface SysFileData extends BaseData {
  /**
   * 文件id，全局唯一，根据该id可以找到一个唯一对应的文件
   */
  fileId: string
  /**
   * 原始文件名称
   */
  fileName: string
  /**
   * 文件大小，单位字节
   */
  fileSize: number

  /**
   * 文件大小(字符串格式)
   */
  fileSizeText: string

  /**
   * 文件MIME
   */
  fileType: string

  /**
   * 文件类型
   */
  ext: string

  /**
   * 下载次数
   */
  downloadCount?: number

  /**
   * 对应的磁盘上的文件是否存在
   */
  fileExist?: boolean
}

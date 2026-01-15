import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysFile extends BaseResp {
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
   * 上传人
   */
  createBy?: string

  /**
   * 上传时间
   */
  createTime?: string
}

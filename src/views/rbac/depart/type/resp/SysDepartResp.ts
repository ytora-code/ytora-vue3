import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysDepartResp extends BaseResp {
  /**
   * 上级部门id
   */
  pid: string
  /**
   * 父资源名称
   */
  pname?: string
  /**
   * 部门名称
   */
  departName: string
  /**
   * 部门编码
   */
  departCode: string
  /**
   * 部门类型
   */
  type: string
  /**
   * 部门联系人username
   */
  contactUserName: string
}

import type BaseParam from '@/types/BaseParam'

/**
 * 数据范围组请求参数
 */
export default interface SysDataScopeGroupParam extends BaseParam {
  /**
   * 所属的资源ID
   */
  permissionId?: number

  /**
   * 分组名称
   */
  name?: string

  /**
   * 分组编码
   */
  code?: string
}

import type BaseData from '@/types/BaseData'

/**
 * 数据范围组响应数据
 */
export default interface SysDataScopeGroupData extends BaseData {
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

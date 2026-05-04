import type BaseData from '@/types/BaseData'

/**
 * 系统配置响应数据
 */
export default interface SysConfigData extends BaseData {
  /**
   * 配置名称
   */
  name?: string
  /**
   * 键
   */
  key?: string
  /**
   * 值
   */
  value?: string
  /**
   * 配置类型
   */
  type?: string
  /**
   * 是否启用
   */
  status?: boolean
}

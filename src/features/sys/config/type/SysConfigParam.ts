import type BaseParam from '@/types/BaseParam'

/**
 * 系统配置请求参数
 */
export default interface SysConfigParam extends BaseParam {
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

import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * 系统资源请求
 */
export default interface SysPermission extends BaseReq {
  /**
   * 父资源id
   */
  pid?: string

  /**
   * 父资源名称
   */
  pname?: string

  /**
   * 资源名称
   */
  permissionName?: string

  /**
   * 资源唯一编码
   */
  permissionCode?: string

  /**
   * 资源类型，1-接口、2-页面、3-页面元素
   */
  permissionType?: 1 | 2 | 3

  /**
   * 前端组件地址（type为页面时生效）
   */
  component?: string

  /**
   * 图标
   */
  icon?: string

  /**
   * 元数据,json格式
   */
  meta?: Record<string, unknown>

  /**
   * 是否可见
   */
  visible?: boolean

  /**
   * 排序
   */
  index?: number

  /**
   * 重定向
   */
  redirect?: string
}

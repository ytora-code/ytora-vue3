/**
 * 系统资源
 */
export default interface SysPermission {
  /**
   * 主键ID
   */
  id: string

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
  permissionName: string

  /**
   * 资源唯一编码
   */
  permissionCode: string

  /**
   * 资源类型
   */
  permissionType?: number

  /**
   * 父资源类型
   */
  parentPermissionType?: number

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
  sort?: number

  /**
   * 重定向
   */
  redirect?: string

  /**
   * 子资源
   */
  children?: Array<SysPermission>
}

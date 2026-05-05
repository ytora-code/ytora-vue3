/**
 * 系统资源
 */
export default interface SysPermissionData {
  /**
   * 主键ID
   */
  id: string

  /**
   * 创建时间
   */
  createTime?: Date

  /**
   * 父资源id
   */
  pid?: string

  /**
   * 父资源名称
   */
  pName?: string

  /**
   * 层级
   */
  level?: number

  /**
   * 资源名称
   */
  permissionName: string

  /**
   * 资源唯一编码
   */
  permissionCode: string

  /**
   * 资源类型，1-接口、2-页面、3-页面元素
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
  index?: number

  /**
   * 重定向
   */
  redirect?: string

  /**
   * 备注
   */
  remark?: string

  /**
   * 子资源
   */
  children?: Array<SysPermissionData>
}

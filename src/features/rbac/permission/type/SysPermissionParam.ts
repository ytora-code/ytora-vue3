import type BaseParam from '@/types/BaseParam'

/**
 * 资源请求参数
 */
export default interface SysPermissionParam extends BaseParam {
  /**
   * 父资源id
   */
  pid?: string
  /**
   * 资源名称
   */
  permissionName?: string
  /**
   * 资源编码，例如：接口地址、页面的路由地址、页面元素(按钮)的唯一标识
   */
  permissionCode?: string
  /**
   * 资源类型，1-接口、2-页面、3-页面元素
   */
  permissionType?: number
  /**
   * 前端组件地址
   */
  component?: string
  /**
   * 图标
   */
  icon?: string
  /**
   * 资源的元数据
   */
  meta?: string
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

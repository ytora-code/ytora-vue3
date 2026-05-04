import type BaseData from '@/types/BaseData'

/**
 * 系统静态API响应数据
 */
export default interface SysStaticApiData extends BaseData {
  /**
   * 接口名称
   */
  name?: string
  /**
   * 基础请求路径
   */
  baseUri?: string
  /**
   * 接口最终请求路径
   */
  uri?: string
  /**
   * 接口请求类型，多个类型使用英文逗号分隔
   */
  type?: string
  /**
   * 所属模块名称
   */
  baseName?: string
  /**
   * 控制器类全限定名
   */
  controllerClassName?: string
  /**
   * 处理器方法签名
   */
  handlerMethod?: string
  /**
   * 接口可消费的媒体类型
   */
  consumes?: string
  /**
   * 接口可生产的媒体类型
   */
  produces?: string
  /**
   * 接口备注
   */
  remark?: string
}

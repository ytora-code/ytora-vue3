import type BaseParam from '@/types/BaseParam'

/**
 * 调度任务请求参数
 */
export default interface SysStaticApiParam extends BaseParam {
  /**
   * 接口名称，模糊匹配
   */
  name?: string

  /**
   * 接口请求路径，模糊匹配
   */
  uri?: string

  /**
   * 接口请求类型，模糊匹配
   */
  type?: string

  /**
   * 所属模块的名称，模糊匹配
   */
  baseName?: string

  /**
   * 控制器类全限定名，模糊匹配
   */
  controllerClassName?: string
}

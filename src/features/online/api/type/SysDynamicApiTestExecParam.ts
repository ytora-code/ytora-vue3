export default interface SysDynamicApiTestExecParam {

  /**
   * 测试使用的dsl内容
   */
  content: string

  /**
   * 测试使用的参数
   */
  param: Record<string, unknown>

  /**
   * 最多查询条数
   */
  max: number

}

import type BaseData from '@/types/BaseData'

/**
 * 动态API接口响应数据
 */
export default interface SysDynamicApiData extends BaseData {

  /**
   * 所属分组ID
   */
  groupId?: string

  /**
   * 接口URI
   */
  uri?: string

  /**
   * 请求方式,1-get/2-post/3-put/delete
   */
  method?: number

  /**
   * 接口名称
   */
  name?: string

  /**
   * 接口类型，1:dsl-sql/2-sql/3-JavaScript/4-python/5-java
   */
  type?: string

  /**
   * 接口内容
   */
  content?: string

  /**
   * 测试参数
   */
  testParam?: string

  /**
   * 是否开启事务
   */
  transactional?: boolean

  /**
   * 最多查询条数
   */
  max?: number

  /**
   * 接口状态，1-未发布/2-已发布
   */
  status?: number

}

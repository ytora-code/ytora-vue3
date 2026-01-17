import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 上午2:58
 * 数据源基本信息
 */
export default interface DataSourceDesc extends BaseResp {
  /**
   * 数据源名称
   */
  name: string
  /**
   * catalog
   */
  catalog: string
  /**
   * schema
   */
  schema: string
  /**
   * 数据源描述
   */
  desc: string
  /**
   * 数据源类型
   */
  dsType: string
  /**
   * 数据库类型
   */
  dbType: string
}

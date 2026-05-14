import type BaseData from '@/types/BaseData'

/**
 * 表格列结构响应数据
 */
export default interface SysTableSchemaData extends BaseData {
  /**
   * 所属表格资源ID
   */
  permissionId?: string | number

  /**
   * 单元格类型
   */
  type?: string

  /**
   * 数据key
   */
  key?: string

  /**
   * 单元格表头标题
   */
  title?: string

  /**
   * 单元格宽度
   */
  width?: number

  /**
   * 单元格内容的align
   */
  align?: string

  /**
   * 单元格固定位置：左/右
   */
  fixed?: string

  /**
   * 文字内容溢出时，是否省略
   */
  ellipsis?: string

  /**
   * 格式化文字
   */
  formatter?: string

  /**
   * 排序
   */
  index?: number

  /**
   * 其他属性
   */
  attr?: string
}

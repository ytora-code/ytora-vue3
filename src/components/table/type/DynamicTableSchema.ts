import type { TableRender, TableRowData, TableRowKeyField } from './TableRenderContext'

type DynamicTableColumnType =
  | 'selection'
  | 'index'
  | 'text'
  | 'number'
  | 'date'
  | 'image'
  | 'link'
  | 'tag'
  | 'switch'
  | 'slot'

type DynamicTableAlign = 'left' | 'center' | 'right'
type DynamicTableFixed = 'left' | 'right'
type DynamicTableTagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

interface DynamicTableTagOption {
  label?: string
  type?: DynamicTableTagType
  bordered?: boolean
  round?: boolean
}

type TableFormatter<Row extends TableRowData = TableRowData> = (
  value: unknown,
  row: Row,
  schema: DynamicTableSchema<Row>,
  rowIndex: number,
) => string | number | null | undefined

type TableValueResolver<Row extends TableRowData = TableRowData> = (
  row: Row,
  rowIndex: number,
  schema: DynamicTableSchema<Row>,
) => unknown

/**
 * 表格列的结构类型
 */
interface DynamicTableSchema<Row extends TableRowData = TableRowData> {
  /**
   * 单元格类型
   */
  type?: DynamicTableColumnType
  /**
   * 单元格唯一key
   */
  key?: string
  /**
   * 数据key
   */
  dataKey?: TableRowKeyField<Row>
  /**
   * 单元格表头标题
   */
  title?: string
  /**
   * 单元格宽度
   */
  width?: number
  /**
   * 单元格最小宽度
   */
  minWidth?: number
  /**
   * 单元格内容的align
   */
  align?: DynamicTableAlign
  /**
   * 单元格固定位置：左/右
   */
  fixed?: DynamicTableFixed
  /**
   * 单元格是否可见
   */
  visible?: boolean
  /**
   * 文字内容溢出时，是否省略
   */
  ellipsis?: boolean
  /**
   * 是否可排序
   */
  sorter?: boolean
  className?: string
  /**
   * 内容为空时，显示的兜底文字
   */
  emptyText?: string
  /**
   * 格式化文字，只对走内置文本显示的列生效。如果写了render，那么formatter就不生效了
   */
  formatter?: TableFormatter<Row>
  /**
   * index列的索引以指定数字起始
   */
  indexStart?: number
  /**
   * 单元格得到的真实值 = TableValueResolver函数的返回值
   */
  valueResolver?: TableValueResolver<Row>

  /**
   * 根据单元格得到的真实值，进行样式渲染
   */
  render?: TableRender<Row>

  /**
   * image类型的相关属性
   */
  imageWidth?: number
  imageHeight?: number
  imageAlt?: string
  imageFallbackSrc?: string
  imagePreviewDisabled?: boolean

  /**
   * link类型的相关属性
   */
  linkText?: string
  linkTarget?: '_blank' | '_self' | '_parent' | '_top'
  linkRel?: string

  /**
   * tag类型的相关属性
   */
  tagMap?: Record<string, DynamicTableTagOption>
  tagSplitPattern?: string | RegExp

  /**
   * switch类型的相关属性
   */
  switchCheckedValue?: string | number | boolean
  switchUncheckedValue?: string | number | boolean
  switchCheckedText?: string
  switchUncheckedText?: string
  switchDisabled?: boolean
}

export type {
  DynamicTableAlign,
  DynamicTableColumnType,
  DynamicTableFixed,
  DynamicTableTagOption,
  DynamicTableTagType,
  TableFormatter,
  TableValueResolver,
}
export default DynamicTableSchema

import type DynamicTableSchema from './DynamicTableSchema'
import type { DynamicTableAlign, DynamicTableColumnType } from './DynamicTableSchema'
import type { TableRowData } from './TableRenderContext'

interface ResolvedDynamicTableSchema<
  Row extends TableRowData = TableRowData,
> extends DynamicTableSchema<Row> {
  key: string
  type: DynamicTableColumnType
  title: string
  visible: boolean
  align: DynamicTableAlign
  ellipsis: boolean
  emptyText: string
  linkTarget: '_blank' | '_self' | '_parent' | '_top'
  linkRel: string
  tagSplitPattern: string | RegExp
  switchCheckedText: string
  switchUncheckedText: string
  switchDisabled: boolean
}

export default ResolvedDynamicTableSchema

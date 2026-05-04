import type { VNodeChild } from 'vue'

import type DynamicTableSchema from './DynamicTableSchema'
import type { TableRowData } from './TableRenderContext'

interface DynamicTableCellSlotProps<Row extends TableRowData = TableRowData> {
  row: Row
  rowIndex: number
  schema: DynamicTableSchema<Row>
  value: unknown
  setValue: (value: unknown) => void
}

interface DynamicTableSelectionSlotProps<Row extends TableRowData = TableRowData> {
  checkedRowKeys: Array<string | number>
  checkedRows: Row[]
}

interface DynamicTableSlots<Row extends TableRowData = TableRowData> {
  empty?: () => VNodeChild
  [name: string]: ((props: DynamicTableCellSlotProps<Row>) => VNodeChild) | undefined
}

export type { DynamicTableCellSlotProps, DynamicTableSelectionSlotProps, DynamicTableSlots }

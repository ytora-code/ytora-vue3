import type { VNodeChild } from 'vue'

import type DynamicTableSchema from './DynamicTableSchema'

type TableRowData = object
type TableRowKeyField<Row extends TableRowData = TableRowData> = Extract<keyof Row, string>

interface TableRenderContext<Row extends TableRowData = TableRowData> {
  row: Row
  rowIndex: number
  schema: DynamicTableSchema<Row>
  value: unknown
  setValue: (value: unknown) => void
}

type TableRender<Row extends TableRowData = TableRowData> = (
  context: TableRenderContext<Row>,
) => VNodeChild

export type { TableRender, TableRenderContext, TableRowData, TableRowKeyField }

import { computed } from 'vue'

import type DynamicTableSchema from '../type/DynamicTableSchema'
import type { DynamicTableAlign, DynamicTableColumnType } from '../type/DynamicTableSchema'
import type ResolvedDynamicTableSchema from '../type/ResolvedDynamicTableSchema'
import type { TableRowData } from '../type/TableRenderContext'

interface UseTableSchemaOptions<Row extends TableRowData> {
  schemas: () => DynamicTableSchema<Row>[]
}

const normalizeType = (type?: DynamicTableColumnType): DynamicTableColumnType => type ?? 'text'

const normalizeAlign = <Row extends TableRowData>(
  schema: DynamicTableSchema<Row>,
  type: DynamicTableColumnType,
): DynamicTableAlign => {
  if (schema.align) return schema.align

  if (['selection', 'index', 'image', 'tag', 'dict', 'switch'].includes(type)) return 'center'
  if (type === 'number') return 'right'
  return 'center'
}

const normalizeWidth = (width?: number) => {
  if (typeof width !== 'number' || Number.isNaN(width) || width <= 0) return undefined
  return Math.floor(width)
}

const normalizeMinWidth = (minWidth?: number) => {
  if (typeof minWidth !== 'number' || Number.isNaN(minWidth) || minWidth <= 0) return undefined
  return Math.floor(minWidth)
}

const useTableSchema = <Row extends TableRowData>(options: UseTableSchemaOptions<Row>) => {
  const resolvedSchemas = computed<ResolvedDynamicTableSchema<Row>[]>(() =>
    options
      .schemas()
      .map((schema, index) => {
        const type = normalizeType(schema.type)
        const key = schema.key ?? schema.dataKey ?? `column-${index}`
        const title = schema.title ?? ''

        return {
          ...schema,
          key,
          type,
          title,
          width: normalizeWidth(schema.width),
          minWidth: normalizeMinWidth(schema.minWidth),
          visible: schema.visible ?? true,
          align: normalizeAlign(schema, type),
          ellipsis:
            schema.ellipsis ?? ['text', 'number', 'date', 'link', 'tag', 'dict'].includes(type),
          emptyText: schema.emptyText ?? '',
          linkTarget: schema.linkTarget ?? '_blank',
          linkRel: schema.linkRel ?? 'noreferrer noopener',
          tagSplitPattern: schema.tagSplitPattern ?? /[,，]/,
          switchCheckedText: schema.switchCheckedText ?? '开',
          switchUncheckedText: schema.switchUncheckedText ?? '关',
          switchDisabled: schema.switchDisabled ?? false,
        }
      })
      .filter((schema) => schema.visible),
  )

  return {
    resolvedSchemas,
  }
}

export { useTableSchema }

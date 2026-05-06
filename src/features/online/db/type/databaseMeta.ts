export interface OnlineDatabaseDataSource {
  name: string
  desc?: string | null
  dsType?: string | null
  dbType?: string | null
  catalog?: string | null
  schema?: string | null
}

export interface OnlineDatabaseColumnMeta {
  catalog?: string | null
  schema?: string | null
  table?: string | null
  columnName?: string | null
  name?: string | null
  comment?: string | null
  columnComment?: string | null
  typeName?: string | null
  columnType?: string | null
  jdbcTypeName?: string | null
  jdbcType?: number | null
  javaType?: string | null
  tsType?: string | null
  primaryKey?: boolean | null
  nullable?: boolean | null
  ordinalPosition?: number | null
  autoIncrement?: boolean | null
  defaultValue?: string | null
  columnLength?: number | null
  decimalDigits?: number | null
}

export interface OnlineDatabaseIndexColumnMeta {
  column?: string | null
  position?: number | null
  order?: string | null
}

export interface OnlineDatabaseIndexMeta {
  name?: string | null
  unique?: boolean | null
  columns?: OnlineDatabaseIndexColumnMeta[] | null
  [key: string]: unknown
}

export interface OnlineDatabaseForeignKeyMeta {
  name?: string | null
  fkName?: string | null
  pkName?: string | null
  fkTable?: string | null
  pkTable?: string | null
  fkColumn?: string | null
  pkColumn?: string | null
  updateRule?: string | null
  deleteRule?: string | null
  columns?: Array<Record<string, unknown>> | null
  [key: string]: unknown
}

export interface OnlineDatabaseObjectMeta {
  name?: string | null
  tableName?: string | null
  viewName?: string | null
  functionName?: string | null
  procedureName?: string | null
  sequenceName?: string | null
  specificName?: string | null
  comment?: string | null
  remarks?: string | null
  description?: string | null
  columnMetas?: OnlineDatabaseColumnMeta[] | null
  primaryKeys?: string[] | null
  foreignKeyMetas?: OnlineDatabaseForeignKeyMeta[] | null
  indexMetas?: OnlineDatabaseIndexMeta[] | null
  [key: string]: unknown
}

import type {
  DatabaseNodeKind,
  DatabaseObjectCategoryKind,
  DatabaseObjectNodeKind,
  OnlineDatabaseForeignKeyMeta,
  OnlineDatabaseIndexMeta,
  DatabaseTreeNode,
  OnlineDatabaseColumnMeta,
  OnlineDatabaseDataSource,
  OnlineDatabaseObjectMeta,
} from '../type'

export const objectCategoryList: Array<{
  kind: DatabaseObjectCategoryKind
  label: string
}> = [
  { kind: 'tables', label: '表' },
  { kind: 'views', label: '视图' },
  { kind: 'functions', label: '函数' },
  { kind: 'procedures', label: '存储过程' },
  { kind: 'sequences', label: '序列' },
]

export const objectKindMap: Record<DatabaseObjectCategoryKind, DatabaseObjectNodeKind> = {
  tables: 'table',
  views: 'view',
  functions: 'function',
  procedures: 'procedure',
  sequences: 'sequence',
}

export const treeIconCodeMap: Record<DatabaseNodeKind, string> = {
  dataSource: 'i-lucide-database',
  schema: 'i-lucide-folder-tree',
  tables: 'i-lucide-table-properties',
  views: 'i-lucide-eye',
  functions: 'i-lucide-square-function',
  procedures: 'i-lucide-workflow',
  sequences: 'i-lucide-arrow-up-1-0',
  table: 'i-lucide-table-2',
  view: 'i-lucide-eye',
  function: 'i-lucide-square-function',
  procedure: 'i-lucide-workflow',
  sequence: 'i-lucide-arrow-up-1-0',
}

const dataSourceIconCodeMap = {
  mariadb: 'mariadb-logo',
  mysql: 'mysql-logo',
  oracle: 'oracle-logo',
  postgresql: 'postgresql-logo',
  sqlite: 'sqlite',
  sqlserver: 'sqlserver-logo',
}

export const buildDataSourceLabel = (item: OnlineDatabaseDataSource) => {
  const extra = [item.dbType, item.catalog].filter(Boolean).join(' / ')
  if (!extra) {
    return item.name
  }
  return `${item.name} (${extra})`
}

export const resolveDataSourceIconCode = (item?: OnlineDatabaseDataSource) => {
  const dbType = item?.dbType?.trim().toLowerCase()
  if (!dbType) {
    return treeIconCodeMap.dataSource
  }

  if (dbType.includes('mariadb')) return dataSourceIconCodeMap.mariadb
  if (dbType.includes('mysql')) return dataSourceIconCodeMap.mysql
  if (dbType.includes('oracle')) return dataSourceIconCodeMap.oracle
  if (dbType.includes('postgresql') || dbType.includes('postgres'))
    return dataSourceIconCodeMap.postgresql
  if (dbType.includes('sqlite')) return dataSourceIconCodeMap.sqlite
  if (dbType.includes('sqlserver') || dbType.includes('sql-server') || dbType.includes('mssql')) {
    return dataSourceIconCodeMap.sqlserver
  }

  return treeIconCodeMap.dataSource
}

export const createDataSourceNode = (item: OnlineDatabaseDataSource): DatabaseTreeNode => ({
  key: `ds:${item.name}`,
  label: buildDataSourceLabel(item),
  kind: 'dataSource',
  dataSourceName: item.name,
  rawMeta: item,
  isLeaf: false,
  loaded: false,
})

export const createSchemaNode = (ds: string, schema: string): DatabaseTreeNode => ({
  key: `schema:${ds}:${schema}`,
  label: schema,
  kind: 'schema',
  dataSourceName: ds,
  schemaName: schema,
  isLeaf: false,
  loaded: false,
})

export const createCategoryNode = (
  ds: string,
  schema: string,
  kind: DatabaseObjectCategoryKind,
  label: string,
): DatabaseTreeNode => ({
  key: `category:${ds}:${schema}:${kind}`,
  label,
  kind,
  dataSourceName: ds,
  schemaName: schema,
  isLeaf: false,
  loaded: false,
})

export const createObjectNode = (
  ds: string,
  schema: string,
  kind: DatabaseObjectNodeKind,
  meta: OnlineDatabaseObjectMeta,
): DatabaseTreeNode => {
  const objectName = resolveObjectName(meta)
  const comment = resolveObjectComment(meta)

  return {
    key: `object:${ds}:${schema}:${kind}:${objectName}`,
    label: objectName,
    kind,
    dataSourceName: ds,
    schemaName: schema,
    objectName,
    comment,
    rawMeta: meta,
    isLeaf: true,
    loaded: true,
  }
}

export const isObjectCategoryNode = (
  node: DatabaseTreeNode,
): node is DatabaseTreeNode & { kind: DatabaseObjectCategoryKind } =>
  ['tables', 'views', 'functions', 'procedures', 'sequences'].includes(node.kind)

export const resolveObjectName = (meta: OnlineDatabaseObjectMeta) =>
  String(
    meta.name ??
      meta.tableName ??
      meta.viewName ??
      meta.functionName ??
      meta.procedureName ??
      meta.sequenceName ??
      meta.specificName ??
      'UNKNOWN',
  )

export const resolveObjectComment = (meta: OnlineDatabaseObjectMeta) => {
  const value = meta.comment ?? meta.remarks ?? meta.description
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : ''
}

export const extractColumnMetas = (meta?: OnlineDatabaseObjectMeta | OnlineDatabaseDataSource) => {
  if (!meta || !('columnMetas' in meta) || !Array.isArray(meta.columnMetas)) {
    return [] as OnlineDatabaseColumnMeta[]
  }
  return meta.columnMetas
}

export const extractPrimaryKeys = (meta?: OnlineDatabaseObjectMeta | OnlineDatabaseDataSource) => {
  if (!meta || !('primaryKeys' in meta) || !Array.isArray(meta.primaryKeys)) {
    return [] as string[]
  }

  return meta.primaryKeys.filter((item): item is string => item.length > 0)
}

export const resolveColumnField = (column: OnlineDatabaseColumnMeta) => {
  const value = column.columnName ?? column.name
  return typeof value === 'string' && value.length > 0 ? value : ''
}

export const resolveColumnTitle = (field: string, column?: OnlineDatabaseColumnMeta) => {
  const comment = resolveColumnComment(column)
  const isPrimaryKey = column?.primaryKey === true
  const pkText = isPrimaryKey ? ' [PK]' : ''
  return comment ? `${field}${pkText}` : `${field}${pkText}`
}

export const resolveColumnComment = (column?: OnlineDatabaseColumnMeta) => {
  const value = column?.comment ?? column?.columnComment
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : ''
}

export const resolveColumnTypeName = (column?: OnlineDatabaseColumnMeta) => {
  return column?.typeName ?? column?.columnType ?? ''
}

export const resolveJdbcTypeLabel = (column?: OnlineDatabaseColumnMeta) => {
  if (column?.jdbcTypeName) {
    return column.jdbcTypeName
  }

  if (column?.jdbcType !== null && column?.jdbcType !== undefined) {
    return String(column.jdbcType)
  }

  return ''
}

export const extractIndexMetas = (meta?: OnlineDatabaseObjectMeta | OnlineDatabaseDataSource) => {
  if (!meta || !('indexMetas' in meta) || !Array.isArray(meta.indexMetas)) {
    return [] as OnlineDatabaseIndexMeta[]
  }

  return meta.indexMetas
}

export const extractForeignKeyMetas = (
  meta?: OnlineDatabaseObjectMeta | OnlineDatabaseDataSource,
) => {
  if (!meta || !('foreignKeyMetas' in meta) || !Array.isArray(meta.foreignKeyMetas)) {
    return [] as OnlineDatabaseForeignKeyMeta[]
  }

  return meta.foreignKeyMetas
}

export const resolveIndexColumnsText = (meta: OnlineDatabaseIndexMeta) => {
  if (!Array.isArray(meta.columns) || meta.columns.length === 0) {
    return '-'
  }

  return meta.columns
    .map((item) => {
      const column = item.column ?? '-'
      const order = item.order ? ` ${item.order}` : ''
      return `${column}${order}`
    })
    .join(', ')
}

const resolveForeignKeyName = (meta: OnlineDatabaseForeignKeyMeta) => {
  return meta.name ?? meta.fkName ?? '-'
}

const resolveForeignKeySourceColumns = (meta: OnlineDatabaseForeignKeyMeta) => {
  if (meta.fkColumn) {
    return meta.fkColumn
  }

  if (Array.isArray(meta.columns) && meta.columns.length > 0) {
    return meta.columns
      .map((item) => String(item.fkColumn ?? item.column ?? item.sourceColumn ?? '-'))
      .join(', ')
  }

  return '-'
}

const resolveForeignKeyTargetColumns = (meta: OnlineDatabaseForeignKeyMeta) => {
  if (meta.pkColumn) {
    return meta.pkColumn
  }

  if (Array.isArray(meta.columns) && meta.columns.length > 0) {
    return meta.columns
      .map((item) => String(item.pkColumn ?? item.referencedColumn ?? item.targetColumn ?? '-'))
      .join(', ')
  }

  return '-'
}

const resolveForeignKeyTargetTable = (meta: OnlineDatabaseForeignKeyMeta) => {
  return meta.pkTable ?? '-'
}

export const mapForeignKeyMetaToRow = (meta: OnlineDatabaseForeignKeyMeta) => ({
  name: resolveForeignKeyName(meta),
  sourceColumns: resolveForeignKeySourceColumns(meta),
  targetTable: resolveForeignKeyTargetTable(meta),
  targetColumns: resolveForeignKeyTargetColumns(meta),
  updateRule: meta.updateRule ?? '-',
  deleteRule: meta.deleteRule ?? '-',
})

export const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const findNodeByKey = (nodes: DatabaseTreeNode[], key: string): DatabaseTreeNode | null => {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }

    if (node.children?.length) {
      const child = findNodeByKey(node.children, key)
      if (child) {
        return child
      }
    }
  }

  return null
}

export const collectMatchedExpandedKeys = (
  nodes: DatabaseTreeNode[],
  keyword: string,
  fallbackKeys: string[],
) => {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return fallbackKeys
  }

  const matchedKeys = new Set<string>()

  const walk = (items: DatabaseTreeNode[]): boolean => {
    let hasMatch = false

    items.forEach((item) => {
      const labelMatched = item.label.toLowerCase().includes(normalized)
      const childMatched = item.children?.length ? walk(item.children) : false

      if (childMatched) {
        matchedKeys.add(item.key)
      }

      if (labelMatched || childMatched) {
        hasMatch = true
      }
    })

    return hasMatch
  }

  walk(nodes)
  return Array.from(matchedKeys)
}

export const collectTreeIconCodes = (dataSources: OnlineDatabaseDataSource[]) => {
  const codes = new Set<string>([...Object.values(treeIconCodeMap), 'i-lucide-loader-circle'])

  dataSources.forEach((item) => {
    codes.add(resolveDataSourceIconCode(item))
  })

  return [...codes]
}

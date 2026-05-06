import type { TreeOption } from 'naive-ui'
import type { DatabaseNodeKind } from './databaseNode'
import type { OnlineDatabaseDataSource, OnlineDatabaseObjectMeta } from './databaseMeta'

export interface DatabaseTreeNode extends TreeOption {
  key: string
  label: string
  kind: DatabaseNodeKind
  isLeaf?: boolean
  loaded?: boolean
  dataSourceName?: string
  schemaName?: string
  objectName?: string
  comment?: string
  rawMeta?: OnlineDatabaseObjectMeta | OnlineDatabaseDataSource
  children?: DatabaseTreeNode[]
}

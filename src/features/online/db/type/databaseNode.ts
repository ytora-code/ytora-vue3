export type DatabaseNodeKind =
  | 'dataSource'
  | 'schema'
  | 'tables'
  | 'views'
  | 'functions'
  | 'procedures'
  | 'sequences'
  | 'table'
  | 'view'
  | 'function'
  | 'procedure'
  | 'sequence'

export type DatabaseObjectCategoryKind = Extract<
  DatabaseNodeKind,
  'tables' | 'views' | 'functions' | 'procedures' | 'sequences'
>

export type DatabaseObjectNodeKind = Exclude<
  DatabaseNodeKind,
  'dataSource' | 'schema' | 'tables' | 'views' | 'functions' | 'procedures' | 'sequences'
>

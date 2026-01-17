import type BaseResp from '@/types/resp/BaseResp.ts'
import type TableMeta from './TableMeta.ts'
import type ViewMeta from './ViewMeta.ts'
import type FunctionMeta from './FunctionMeta.ts'
import type ProcedureMeta from './ProcedureMeta.ts'
import type SequenceMeta from './SequenceMeta.ts'

/**
 * created by YT on 2026/1/17 上午2:58
 * 数据库对象汇总
 */
export default interface DbObjDesc extends BaseResp {
  /**
   * 表
   */
  tableMetas: TableMeta[]
  /**
   * 视图
   */
  viewMetas: ViewMeta[]
  /**
   * 函数
   */
  functionMetas: FunctionMeta[]
  /**
   * 存储过程
   */
  procedureMetas?: ProcedureMeta[]
  /**
   * 序列
   */
  sequenceMetas?: SequenceMeta[]
}

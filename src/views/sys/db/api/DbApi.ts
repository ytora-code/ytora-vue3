import BaseApi from '@/api/BaseApi'
import type DataSourceDesc from '../type/resp/DataSourceDesc.ts'
import type TableMeta from '@/views/sys/db/type/resp/TableMeta.ts'
import type ViewMeta from '@/views/sys/db/type/resp/ViewMeta.ts'
import type FunctionMeta from '@/views/sys/db/type/resp/FunctionMeta.ts'
import type ProcedureMeta from '@/views/sys/db/type/resp/ProcedureMeta.ts'
import type SequenceMeta from '@/views/sys/db/type/resp/SequenceMeta.ts'
import type FetchDataReq from '@/views/sys/db/type/req/FetchDataReq.ts'

class DbApi extends BaseApi {
  constructor() {
    super('/sys/db')
  }

  // ============================== 数据源 SCHEMA =================================>

  /**
   * 获取当前系统所有数据源
   */
  dataSources = () => {
    return this.get<DataSourceDesc[]>('dataSources')
  }

  /**
   * 获取指定数据源的所有模式
   */
  schemas = (ds: string) => {
    return this.get<string[], { ds: string }>('schemas', { ds })
  }

  // ========================================= SCHEMA下面的对象 =========================================>

  /**
   * 获取指定数据源指定schema的下面的table
   */
  tables = (ds: string, schema: string) => {
    return this.get<TableMeta[], { ds: string; schema: string }>('tables', { ds, schema })
  }

  /**
   * 获取指定数据源指定schema的下面的view
   */
  views = (ds: string, schema: string) => {
    return this.get<ViewMeta[], { ds: string; schema: string }>('views', { ds, schema })
  }

  /**
   * 获取指定数据源指定schema的下面的function
   */
  functions = (ds: string, schema: string) => {
    return this.get<FunctionMeta[], { ds: string; schema: string }>('functions', { ds, schema })
  }

  /**
   * 获取指定数据源指定schema的下面的procedure
   */
  procedures = (ds: string, schema: string) => {
    return this.get<ProcedureMeta[], { ds: string; schema: string }>('procedures', { ds, schema })
  }

  /**
   * 获取指定数据源指定schema的下面的sequences
   */
  sequences = (ds: string, schema: string) => {
    return this.get<SequenceMeta[], { ds: string; schema: string }>('sequences', { ds, schema })
  }

  // ========================================= CRUD =========================================>

  /**
   * 表和视图的真实数据内容
   */
  fetchData = (data: FetchDataReq, pageNo: number, pageSize: number) => {
    return this.post<Record<string, unknown>[], FetchDataReq>(
      `fetchData?pageNo=${pageNo}&pageSize=${pageSize}`,
      data,
    )
  }

  /**
   * 表和视图的真实数据总量
   */
  fetchCount = (data: FetchDataReq) => {
    return this.post<number, FetchDataReq>('fetchCount', data)
  }
}

// 导出单例
export const dbApi = new DbApi()

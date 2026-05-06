import BaseApi from '@/api/BaseApi'
import type {
  OnlineDatabaseDataSource,
  OnlineDatabaseFetchDataParam,
  OnlineDatabaseObjectMeta,
  OnlineDatabasePageData,
} from '../type'
import type PageParam from '@/types/PageParam'

class OnlineDatabaseApi extends BaseApi {
  constructor() {
    super('/online/database')
  }

  dataSources = () => this.get<OnlineDatabaseDataSource[]>('dataSources')

  schemas = (ds: string) => this.get<string[], { ds: string }>('schemas', { ds })

  tables = (ds: string, schema: string) =>
    this.get<OnlineDatabaseObjectMeta[], { ds: string; schema: string }>('tables', { ds, schema })

  views = (ds: string, schema: string) =>
    this.get<OnlineDatabaseObjectMeta[], { ds: string; schema: string }>('views', { ds, schema })

  functions = (ds: string, schema: string) =>
    this.get<OnlineDatabaseObjectMeta[], { ds: string; schema: string }>('functions', {
      ds,
      schema,
    })

  procedures = (ds: string, schema: string) =>
    this.get<OnlineDatabaseObjectMeta[], { ds: string; schema: string }>('procedures', {
      ds,
      schema,
    })

  sequences = (ds: string, schema: string) =>
    this.get<OnlineDatabaseObjectMeta[], { ds: string; schema: string }>('sequences', {
      ds,
      schema,
    })

  fetchData = (data: OnlineDatabaseFetchDataParam, params?: PageParam) =>
    this.post<OnlineDatabasePageData, OnlineDatabaseFetchDataParam, PageParam>(
      'fetchData',
      data,
      params,
    )
}

export const onlineDatabaseApi = new OnlineDatabaseApi()

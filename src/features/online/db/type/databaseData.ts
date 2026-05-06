import type PageData from '@/types/PageData'

export interface OnlineDatabaseFetchDataParam {
  ds: string
  schema: string
  name: string
  where?: string
  orderCol?: string
}

export type OnlineDatabaseRecord = Record<string, unknown>

export type OnlineDatabasePageData = PageData<OnlineDatabaseRecord>

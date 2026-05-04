import BaseApi from '@/api/BaseApi'
import type { DbDynamicData, DbStaticData } from '../type/monitor'

class MonitorDbApi extends BaseApi {
  constructor() {
    super('/monitor/db')
  }

  overview = () => this.get<DbDynamicData>('overview')
  dataSources = () => this.get<DbStaticData>('dataSources')
}

export const monitorDbApi = new MonitorDbApi()

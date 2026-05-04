import BaseApi from '@/api/BaseApi'
import type AppSseMetricsData from '@/features/monitor/sse/type/data/AppSseMetricsData'
import type {
  AppBasicInfoData,
  AppBusinessMetricsData,
  AppErrorMetricsData,
  AppOverviewData,
  AppRequestMetricsData,
  AppStatusData,
} from '../type/monitor'

class MonitorAppApi extends BaseApi {
  constructor() {
    super('/monitor/app')
  }

  basicInfo = () => this.get<AppBasicInfoData>('basicInfo')
  overview = () => this.get<AppOverviewData>('overview')
  status = () => this.get<AppStatusData>('status')
  sse = () => this.get<AppSseMetricsData>('sse')
  requests = () => this.get<AppRequestMetricsData>('requests')
  errors = () => this.get<AppErrorMetricsData>('errors')
  businessMetrics = () => this.get<AppBusinessMetricsData>('businessMetrics')
}

export const monitorAppApi = new MonitorAppApi()

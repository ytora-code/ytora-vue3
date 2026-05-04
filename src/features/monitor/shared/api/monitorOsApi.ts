import BaseApi from '@/api/BaseApi'
import type {
  OsBasicInfoData,
  OsCpuDynamicData,
  OsCpuStaticData,
  OsDiskDynamicData,
  OsDiskStaticData,
  OsMemDynamicData,
  OsMemStaticData,
  OsNetDynamicData,
  OsOtherMetricsData,
  OsProcessData,
} from '../type/monitor'

class MonitorOsApi extends BaseApi {
  constructor() {
    super('/monitor/os')
  }

  // 后端实际代码当前使用 /baseInfo，而不是提示词中的 /basicInfo。
  basicInfo = () => this.get<OsBasicInfoData>('baseInfo')

  // 当前后端已经拆成 /cpu 与 /cpuRealtime。
  // 如果后续后端改回同路径复用，这里集中调整即可，页面层不需要改。
  cpuStatic = () => this.get<OsCpuStaticData>('cpu')
  cpuDynamic = () => this.get<OsCpuDynamicData>('cpuRealtime')
  memoryStatic = () => this.get<OsMemStaticData>('memory')
  memoryDynamic = () => this.get<OsMemDynamicData>('memoryRealtime')
  diskStatic = () => this.get<OsDiskStaticData>('disk')
  diskDynamic = () => this.get<OsDiskDynamicData>('diskRealtime')
  network = () => this.get<OsNetDynamicData[]>('network')
  topProcesses = () => this.get<OsProcessData[]>('topProcesses')
  otherMetrics = () => this.get<OsOtherMetricsData>('otherMetrics')
}

export const monitorOsApi = new MonitorOsApi()

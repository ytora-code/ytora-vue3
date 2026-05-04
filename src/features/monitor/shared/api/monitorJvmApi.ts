import BaseApi from '@/api/BaseApi'
import type {
  JvmBasicInfoData,
  JvmClassLoadingData,
  JvmCompilationData,
  JvmGarbageCollectorData,
  JvmMemoryData,
  JvmRuntimeData,
  JvmThreadData,
} from '../type/monitor'

class MonitorJvmApi extends BaseApi {
  constructor() {
    super('/monitor/jvm')
  }

  basicInfo = () => this.get<JvmBasicInfoData>('basicInfo')
  runtime = () => this.get<JvmRuntimeData>('runtime')
  memory = () => this.get<JvmMemoryData>('memory')
  thread = () => this.get<JvmThreadData>('thread')
  gc = () => this.get<JvmGarbageCollectorData[]>('gc')
  classLoading = () => this.get<JvmClassLoadingData>('classLoading')
  compilation = () => this.get<JvmCompilationData>('compilation')
}

export const monitorJvmApi = new MonitorJvmApi()

export interface AppBasicInfoData {
  applicationName: string | null
  applicationVersion: string | null
  contextPath: string | null
  port: string | null
  activeProfiles: string[] | null
  startTime: number | null
  pid: number | null
}

export interface AppOverviewData {
  healthStatus: string | null
  applicationActive: boolean | null
  livenessState: string | null
  readinessState: string | null
  uptime: number | null
  activeRequestCount: number | null
  peakRequestCount: number | null
  totalRequestCount: number | null
  averageDurationMs: number | null
  sseConnectionCount: number | null
  totalErrorCount: number | null
  recentErrorCount: number | null
  businessMetricCount: number | null
  timestamp: number | null
}

export interface AppStatusHealthComponent {
  name: string | null
  status: string | null
}

export interface AppStatusData {
  applicationActive: boolean | null
  livenessState: string | null
  readinessState: string | null
  healthStatus: string | null
  healthComponents: AppStatusHealthComponent[] | null
  uptime: number | null
  startTime: number | null
  timestamp: number | null
}

export interface AppSlowRequestItem {
  startTime: number | null
  method: string | null
  path: string | null
  query: string | null
  status: number | null
  durationMs: number | null
  clientIp: string | null
  userId: string | null
  userName: string | null
  error: string | null
}

export interface AppRequestMetricsData {
  activeRequestCount: number | null
  peakRequestCount: number | null
  totalRequestCount: number | null
  averageDurationMs: number | null
  topSlowRequests: AppSlowRequestItem[] | null
  timestamp: number | null
}

export interface AppErrorItem {
  timestamp: number | null
  category: string | null
  exceptionClass: string | null
  message: string | null
  path: string | null
  method: string | null
  clientIp: string | null
  userId: string | null
  userName: string | null
  stackTrace: string | null
}

export interface AppErrorMetricsData {
  totalErrorCount: number | null
  recentErrors: AppErrorItem[] | null
  timestamp: number | null
}

export interface AppBusinessMetricItem {
  name: string | null
  description: string | null
  type: string | null
  counterValue: number | null
  gaugeValue: number | null
  totalCount: number | null
  successCount: number | null
  failureCount: number | null
  totalDurationMs: number | null
  averageDurationMs: number | null
  maxDurationMs: number | null
  lastDurationMs: number | null
  lastUpdatedTime: number | null
  timestamp: number | null
}

export interface AppBusinessMetricsData {
  metricCount: number | null
  highFrequencyTop10: AppBusinessMetricItem[] | null
  metrics: AppBusinessMetricItem[] | null
  timestamp: number | null
}

export interface DbDataSourceItem {
  name: string | null
  description: string | null
  driverClassName: string | null
  url: string | null
  username: string | null
  type: string | null
}

export interface DbDataSourceRuntimeItem {
  name: string | null
  poolType: string | null
  activeConnections: number | null
  idleConnections: number | null
  totalConnections: number | null
  threadsAwaitingConnection: number | null
  jdbcUrl: string | null
  databaseProductName: string | null
}

export interface DbSlowSqlItem {
  timestamp: number | null
  sqlType: string | null
  elapsedMillis: number | null
  sql: string | null
  paramsText: string | null
  exceptionClass: string | null
  exceptionMsg: string | null
  success: boolean | null
}

export interface DbHotSlowSqlItem {
  fingerprint: string | null
  sqlType: string | null
  sampleSql: string | null
  sampleParamsText: string | null
  count: number | null
  averageDurationMs: number | null
  maxDurationMs: number | null
  firstSeenTime: number | null
  lastSeenTime: number | null
  score: number | null
}

export interface DbDynamicData {
  totalSqlCount: number | null
  successSqlCount: number | null
  failureSqlCount: number | null
  averageDurationMs: number | null
  maxDurationMs: number | null
  slowSqlCount: number | null
  slowSqlThreshold: number | null
  recentSlowSqls: DbSlowSqlItem[] | null
  hotSlowSqls: DbHotSlowSqlItem[] | null
  dataSources: DbDataSourceRuntimeItem[] | null
  timestamp: number | null
}

export interface DbStaticData {
  primaryKey: string | null
  dataSources: DbDataSourceItem[] | null
}

export interface JvmBasicInfoData {
  vmName: string | null
  vmVendor: string | null
  vmVersion: string | null
  specName: string | null
  specVendor: string | null
  specVersion: string | null
  managementSpecVersion: string | null
  javaHome: string | null
  javaVersion: string | null
  javaVendor: string | null
  javaVmInfo: string | null
  inputArguments: string[] | null
  bootClassPathSupported: boolean | null
  systemPropertiesCount: number | null
  startTime: number | null
}

export interface JvmRuntimeData {
  name: string | null
  pid: number | null
  uptime: number | null
  startTime: number | null
  systemLoadAverage: number | null
  availableProcessors: number | null
  shutdownHooksSupported: boolean | null
  libraryPath: string | null
  classPath: string | null
  bootClassPath: string | null
  timezone: string | null
  charset: string | null
  userDir: string | null
  timestamp: number | null
}

export interface JvmMemoryArea {
  init: number | null
  used: number | null
  committed: number | null
  max: number | null
  usedRate: number | null
  committedRate: number | null
  usedText: string | null
  committedText: string | null
  maxText: string | null
}

export interface JvmMemoryPoolItem {
  name: string | null
  type: string | null
  usage: JvmMemoryArea | null
  peakUsage: JvmMemoryArea | null
  collectionUsage: JvmMemoryArea | null
  managerNames: string[] | null
  usageThresholdSupported: boolean | null
  collectionUsageThresholdSupported: boolean | null
  valid: boolean | null
}

export interface JvmBufferPoolItem {
  name: string | null
  count: number | null
  memoryUsed: number | null
  totalCapacity: number | null
  memoryUsedText: string | null
  totalCapacityText: string | null
}

export interface JvmMemoryData {
  heap: JvmMemoryArea | null
  nonHeap: JvmMemoryArea | null
  objectPendingFinalizationCount: number | null
  memoryPools: JvmMemoryPoolItem[] | null
  bufferPools: JvmBufferPoolItem[] | null
  timestamp: number | null
}

export interface JvmThreadData {
  threadCount: number | null
  daemonThreadCount: number | null
  peakThreadCount: number | null
  startedThreadCount: number | null
  deadlockedThreadCount: number | null
  deadlockedThreadIds: number[] | null
  threadStateCounts: Record<string, number> | null
  currentThreadCpuTimeSupported: boolean | null
  threadContentionMonitoringSupported: boolean | null
  threadCpuTimeEnabled: boolean | null
  threadContentionMonitoringEnabled: boolean | null
  timestamp: number | null
}

export interface JvmGarbageCollectorData {
  name: string | null
  collectionCount: number | null
  collectionTime: number | null
  memoryPoolNames: string[] | null
  valid: boolean | null
  timestamp: number | null
}

export interface JvmClassLoadingData {
  loadedClassCount: number | null
  unloadedClassCount: number | null
  totalLoadedClassCount: number | null
  verbose: boolean | null
  timestamp: number | null
}

export interface JvmCompilationData {
  compilerName: string | null
  compilationTimeMonitoringSupported: boolean | null
  totalCompilationTime: number | null
  timestamp: number | null
}

export interface OsBasicInfoData {
  hostName: string | null
  ipAddresses: string[] | null
  macAddresses: string[] | null
  osName: string | null
  osVersion: string | null
  osDescription: string | null
  kernelVersion: string | null
  arch: string | null
  bootTime: number | null
  uptime: number | null
  timeZone: string | null
}

export interface OsCpuStaticData {
  cpuName: string | null
  physicalPackageCount: number | null
  physicalProcessorCount: number | null
  logicalProcessorCount: number | null
  cpu64bit: boolean | null
  identifier: string | null
}

export interface OsCpuDynamicData {
  totalUsage: number | null
  sysUsage: number | null
  userUsage: number | null
  waitUsage: number | null
  idleUsage: number | null
  perCpuUsage: number[] | null
  loadAverage: number[] | null
  timestamp: number | null
}

export interface OsMemStaticData {
  total: number | null
  totalGb: string | null
  pageSize: number | null
}

export interface OsMemDynamicData {
  used: number | null
  available: number | null
  usageRate: number | null
  swapTotal: number | null
  swapUsed: number | null
  swapFree: number | null
  swapUsageRate: number | null
  timestamp: number | null
}

export interface OsPhysicalDisk {
  model: string | null
  name: string | null
  size: number | null
}

export interface OsLogicalPartition {
  mount: string | null
  type: string | null
  total: number | null
}

export interface OsDiskStaticData {
  physicalDisks: OsPhysicalDisk[] | null
  logicalPartitions: OsLogicalPartition[] | null
}

export interface OsPartitionUsage {
  mount: string | null
  used: number | null
  free: number | null
  usageRate: number | null
}

export interface OsDiskIoRate {
  name: string | null
  readSpeed: number | null
  writeSpeed: number | null
}

export interface OsDiskDynamicData {
  partitionUsages: OsPartitionUsage[] | null
  ioRates: OsDiskIoRate[] | null
  timestamp: number | null
}

export interface OsNetDynamicData {
  ifaceName: string | null
  rxSpeed: number | null
  txSpeed: number | null
  rxBytes: number | null
  txBytes: number | null
  timestamp: number | null
}

export interface OsProcessData {
  pid: number | null
  name: string | null
  cpuUsage: number | null
  memUsage: number | null
  path: string | null
  uptime: number | null
}

export interface OsGpuInfo {
  name: string | null
  memoryTotal: number | null
  memoryUsed: number | null
  temperature: number | null
}

export interface OsOtherMetricsData {
  openFileDescriptors: number | null
  maxFileDescriptors: number | null
  processCount: number | null
  threadCount: number | null
  tcpEstablished: number | null
  tcpActiveOpens: number | null
  tcpPassiveOpens: number | null
  gpus: OsGpuInfo[] | null
}

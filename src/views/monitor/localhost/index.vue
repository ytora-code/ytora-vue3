<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NCard, NGi, NGrid, NProgress, NSpace, NStatistic, NTag } from 'naive-ui'

/**
 * --- 类型定义 (解决 Any 问题) ---
 */
interface PerformanceMemory {
  readonly jsHeapSizeLimit: number
  readonly totalJSHeapSize: number
  readonly usedJSHeapSize: number
}

// 扩展 Performance 接口
interface PerformanceWithMemory extends Performance {
  readonly memory?: PerformanceMemory
}

// 扩展 Navigator 接口
interface NavigatorExtended extends Navigator {
  readonly deviceMemory?: number // 系统内存 (GB)
  readonly connection?: {
    readonly effectiveType: string
    readonly downlink: number
    readonly rtt: number
  }
}

interface BatteryManager extends EventTarget {
  charging: boolean
  level: number
  chargingTime: number
  dischargingTime: number
}

/**
 * --- 响应式数据 ---
 */
const memory = ref<PerformanceMemory>({ jsHeapSizeLimit: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 })
const storage = ref({ quota: 0, usage: 0 })
const cpuCores = ref<number | string>(navigator.hardwareConcurrency || '未知')
const deviceMemory = ref<number | string>((navigator as NavigatorExtended).deviceMemory || '未知')
const network = ref({ type: '未知', speed: 0, latency: 0 })
const battery = ref({ level: 100, charging: true })
const fps = ref(60)

// 计算属性：内存使用率
const memoryPercent = computed(() => {
  if (memory.value.jsHeapSizeLimit === 0) return 0
  return Math.round((memory.value.usedJSHeapSize / memory.value.jsHeapSizeLimit) * 100)
})

/**
 * --- 指标采集逻辑 ---
 */

// 1. 获取内存信息 (Chromium 特有)
const updateMemory = () => {
  const perf = (performance as PerformanceWithMemory).memory
  if (perf) {
    memory.value = {
      jsHeapSizeLimit: perf.jsHeapSizeLimit,
      totalJSHeapSize: perf.totalJSHeapSize,
      usedJSHeapSize: perf.usedJSHeapSize,
    }
  }
}

// 2. 获取存储配额 (磁盘)
const updateStorage = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate()
    storage.value = {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
    }
  }
}

// 3. 获取网络状态
const updateNetwork = () => {
  const conn = (navigator as NavigatorExtended).connection
  if (conn) {
    network.value = {
      type: conn.effectiveType,
      speed: conn.downlink,
      latency: conn.rtt,
    }
  }
}

// 4. 获取电池信息
const updateBattery = async () => {
  const nav = navigator as unknown as { getBattery?: () => Promise<BatteryManager> }
  if (nav.getBattery) {
    const b = await nav.getBattery()
    battery.value = {
      level: b.level * 100,
      charging: b.charging,
    }
  }
}

// 5. 计算 FPS (每秒帧数)
let lastFrameTime = performance.now()
let frameCount = 0
const calculateFPS = () => {
  const now = performance.now()
  frameCount++
  if (now >= lastFrameTime + 1000) {
    fps.value = frameCount
    frameCount = 0
    lastFrameTime = now
  }
  requestAnimationFrame(calculateFPS)
}

// 辅助：单位转换
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * --- 生命周期 ---
 */
let timer: number
onMounted(() => {
  updateMemory()
  updateStorage()
  updateNetwork()
  updateBattery()
  calculateFPS()

  timer = window.setInterval(() => {
    updateMemory()
    updateNetwork()
  }, 2000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="monitor-container">
    <n-space vertical size="large">
      <h2>🖥️ 系统与浏览器实时监控</h2>

      <n-grid x-gap="12" y-gap="12" :cols="24">
        <!-- 内存占用情况 -->
        <n-gi :span="12">
          <n-card title="网页内存占用 (JS Heap)" hoverable>
            <n-grid :cols="2">
              <n-gi>
                <n-statistic label="已用内存" :value="formatBytes(memory.usedJSHeapSize)" />
              </n-gi>
              <n-gi>
                <n-statistic label="当前分配" :value="formatBytes(memory.totalJSHeapSize)" />
              </n-gi>
            </n-grid>
            <div style="margin-top: 15px">
              <p>堆内存使用率 (上限: {{ formatBytes(memory.jsHeapSizeLimit) }})</p>
              <n-progress
                type="line"
                :percentage="memoryPercent"
                :indicator-placement="'inside'"
                processing
              />
            </div>
          </n-card>
        </n-gi>

        <!-- 硬件基础信息 -->
        <n-gi :span="12">
          <n-card title="硬件与渲染性能" hoverable>
            <n-grid :cols="2">
              <n-gi>
                <n-statistic label="逻辑核心数" :value="cpuCores" />
              </n-gi>
              <n-gi>
                <n-statistic label="物理内存近似值" :value="deviceMemory + ' GB'" />
              </n-gi>
              <n-gi style="margin-top: 10px">
                <n-statistic label="当前帧率 (FPS)">
                  <span :style="{ color: fps < 30 ? 'red' : 'green' }">{{ fps }}</span>
                </n-statistic>
              </n-gi>
              <n-gi style="margin-top: 10px">
                <n-statistic label="设备电量">
                  <n-tag :type="battery.charging ? 'success' : 'warning'">
                    {{ battery.level }}% {{ battery.charging ? '(充电中)' : '(放电中)' }}
                  </n-tag>
                </n-statistic>
              </n-gi>
            </n-grid>
          </n-card>
        </n-gi>

        <!-- 磁盘存储 -->
        <n-gi :span="12">
          <n-card title="浏览器存储配额 (Disk Quota)" hoverable>
            <n-statistic label="已占用存储" :value="formatBytes(storage.usage)" />
            <n-statistic label="浏览器总可用配额" :value="formatBytes(storage.quota)" />
            <template #footer>
              <n-tag size="small">注：此为浏览器为本域名分配的虚拟磁盘空间</n-tag>
            </template>
          </n-card>
        </n-gi>

        <!-- 网络信息 -->
        <n-gi :span="12">
          <n-card title="网络连接状态" hoverable>
            <n-grid :cols="2">
              <n-gi>
                <n-statistic label="连接类型" :value="network.type.toUpperCase()" />
              </n-gi>
              <n-gi>
                <n-statistic label="预估下行带宽" :value="network.speed + ' Mbps'" />
              </n-gi>
            </n-grid>
            <template #footer> 延迟 (RTT): {{ network.latency }} ms</template>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card title="关于垃圾回收 (GC)">
        <p>
          由于浏览器安全策略（防止侧信道攻击和指纹追踪），**Web 标准 API 严格禁止**网页脚本获取 GC
          次数、GC 耗时或主动触发 GC。
        </p>
        <p>
          若需要深度监控，请考虑使用 <b>Electron</b> 开发桌面应用，或使用 Chrome DevTools 的
          <b>Performance Monitor</b> 面板。
        </p>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.monitor-container {
  padding: 24px;
  background-color: #f9f9fb;
  min-height: 100vh;
}

:deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>

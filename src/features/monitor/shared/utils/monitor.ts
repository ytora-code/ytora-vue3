import { NTag } from 'naive-ui'
import { h } from 'vue'

export interface KeyValueItem {
  label: string
  value: string
  mono?: boolean
}

export const EMPTY_TEXT = '--'

export const safeArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : []
}

export const formatText = (value: unknown, fallback: string = EMPTY_TEXT): string => {
  if (value === null || value === undefined) {
    return fallback
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : fallback
  }

  return String(value)
}

export const formatList = (
  value: unknown[] | null | undefined,
  fallback: string = EMPTY_TEXT,
): string => {
  if (!value || value.length === 0) {
    return fallback
  }
  return value.map((item) => formatText(item)).join('、')
}

export const formatNumber = (value: number | null | undefined, digits: number = 0): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }
  return `${formatNumber(value, value % 1 === 0 ? 0 : 2)}%`
}

export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) {
    return EMPTY_TEXT
  }
  return value ? '是' : '否'
}

export const formatDateTime = (value: number | null | undefined): string => {
  if (!value) {
    return EMPTY_TEXT
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
}

export const formatTimeLabel = (value: number | null | undefined): string => {
  if (!value) {
    return EMPTY_TEXT
  }
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
}

export const formatDurationMs = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }

  const totalMs = Math.max(0, Math.round(value))
  if (totalMs < 1000) {
    return `${totalMs} ms`
  }

  const totalSeconds = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = [
    days > 0 ? `${days}天` : '',
    hours > 0 ? `${hours}小时` : '',
    minutes > 0 ? `${minutes}分` : '',
    seconds > 0 ? `${seconds}秒` : '',
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' ') : `${formatNumber(totalMs / 1000, 2)} 秒`
}

export const formatDurationSeconds = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }
  return formatDurationMs(value * 1000)
}

export const formatBytes = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = Math.max(0, value)
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${formatNumber(size, size >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

export const formatBytesPerSecond = (value: number | null | undefined): string => {
  const text = formatBytes(value)
  return text === EMPTY_TEXT ? text : `${text}/s`
}

export const formatMilliseconds = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_TEXT
  }
  return `${formatNumber(value, value % 1 === 0 ? 0 : 2)} ms`
}

export const formatStatusText = (value: string | null | undefined): string => {
  const text = formatText(value)
  return text === EMPTY_TEXT ? text : text.toUpperCase()
}

export const statusTagType = (
  value: string | boolean | null | undefined,
): 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' => {
  if (typeof value === 'boolean') {
    return value ? 'success' : 'error'
  }

  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()

  if (!normalized) {
    return 'default'
  }

  if (
    ['UP', 'RUNNING', 'CORRECT', 'ALIVE', 'ACCEPTING_TRAFFIC', 'SUCCESS', 'READY'].includes(
      normalized,
    )
  ) {
    return 'success'
  }

  if (
    ['DOWN', 'BROKEN', 'REFUSING_TRAFFIC', 'FAILURE', 'FAILED', 'ERROR', 'DEAD'].includes(
      normalized,
    )
  ) {
    return 'error'
  }

  if (['OUT_OF_SERVICE', 'UNKNOWN', 'WARNING'].includes(normalized)) {
    return 'warning'
  }

  return 'info'
}

export const renderStatusTag = (value: string | boolean | null | undefined) => {
  const text = typeof value === 'boolean' ? formatBoolean(value) : formatStatusText(value)
  return h(
    NTag,
    {
      bordered: false,
      size: 'small',
      type: statusTagType(value),
    },
    { default: () => text },
  )
}

export const buildTimestampText = (timestamps: Array<number | null | undefined>): string => {
  const latest = timestamps
    .filter((item): item is number => typeof item === 'number')
    .sort((a, b) => b - a)[0]
  return formatDateTime(latest)
}

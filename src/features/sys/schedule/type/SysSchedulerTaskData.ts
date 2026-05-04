import type BaseData from '@/types/BaseData'

/**
 * 调度任务响应数据
 */
export default interface SysSchedulerTaskData extends BaseData {
  /**
   * 时间轮任务ID
   */
  timeWheelTaskId?: string
  /**
   * 任务名称
   */
  taskName?: string
  /**
   * 任务code
   */
  taskCode?: string
  /**
   * 任务执行CRON
   */
  cron?: string
  /**
   * 任务类型
   */
  type?: number
  /**
   * 任务参数
   */
  params?: string
  /**
   * 任务状态，1-运行中/2-未启动
   */
  status?: number
}

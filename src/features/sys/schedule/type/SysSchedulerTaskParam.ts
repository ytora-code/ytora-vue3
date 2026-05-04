import type BaseParam from '@/types/BaseParam'

/**
 * 调度任务请求参数
 */
export default interface SysSchedulerTaskParam extends BaseParam {
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
   * 任务状态，1-未启动/2-运行中
   */
  status?: number
}

import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysSchedulerTaskData from '../type/SysSchedulerTaskData'
import type SysSchedulerTaskParam from '../type/SysSchedulerTaskParam'

class SysSchedulerTaskApi extends BaseApi {
  constructor() {
    super('/sys/scheduler-task')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysSchedulerTaskParam & PageParam) => {
    return this.get<PageData<SysSchedulerTaskData>, SysSchedulerTaskParam & PageParam>(
      'page',
      params,
    )
  }

  /**
   * 根据ID查询
   */
  queryById = (id: string | number) => {
    return this.get<SysSchedulerTaskData, { id: string | number }>('queryById', { id })
  }

  /**
   * 新增或编辑
   */
  upsert = (data: SysSchedulerTaskParam) => {
    return this.post<unknown, SysSchedulerTaskParam>('upsert', data)
  }

  /**
   * 删除数据
   */
  deleteByIds = (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) {
      return Promise.reject('待删除数据的id数组不能为空')
    }
    return this.delete<unknown, { ids: string }>('deleteByIds', { ids: ids.join(',') })
  }

  // ============================== EXCEL导入导出 =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入数据
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出数据
   */
  export = (params: SysSchedulerTaskParam) => {
    return this.download<SysSchedulerTaskParam>('export', params)
  }

  // ============================== 其他 =================================>
  /**
   * 立刻执行一次
   */
  runOnce = (id: string | number) => {
    return this.get<unknown, { id: string | number }>('runOnce', { id })
  }

  /**
   * 启动任务
   */
  start = (id: string | number) => {
    return this.get<unknown, { id: string | number }>('start', { id })
  }

  /**
   * 关闭任务
   */
  stop = (id: string | number) => {
    return this.get<unknown, { id: string | number }>('stop', { id })
  }
}

export default new SysSchedulerTaskApi()

import BaseApi from '@/api/BaseApi'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageResp from '@/types/resp/PageResp.ts'
import type SysUserReq from '@/views/rbac/user/type/req/SysUserReq.ts'
import type { AxiosProgressEvent } from 'axios'

class UserApi extends BaseApi {
  constructor() {
    super('/rbac/user')
  }

  // ============================== CRUD =================================>

  /**
   * 分页请求
   */
  page = (params: SysUserReq) => {
    return this.get<PageResp<SysUserResp>, SysUserReq>('page', params)
  }

  /**
   * 新增或编辑
   */
  insertOrUpdate = (data: SysUserReq) => {
    return this.post<unknown, SysUserReq>('insertOrUpdate', data)
  }

  /**
   * 删除数据
   */
  remove = (id: string | undefined) => {
    return this.delete<unknown, { id: string | undefined }>('delete', { id })
  }

  // ============================== EXCEL =================================>

  /**
   * 下载导入模板
   */
  downloadTemplate = () => {
    return this.download<unknown>('downloadTemplate')
  }

  /**
   * 导入
   */
  import = (
    formData: FormData,
    progress?: (loaded: number, total: number, percent: number) => void,
  ) => {
    return this.upload<string>('import', formData, progress)
  }

  /**
   * 导出
   */
  export = (params: SysUserReq) => {
    return this.download<SysUserReq>('export', params)
  }
}

// 导出单例
export const userApi = new UserApi()

import BaseApi from '@/api/BaseApi'
import SysDynamicApiTestExecParam from '@/features/online/api/type/SysDynamicApiTestExecParam'

class SysDynamicApiApi extends BaseApi {

  constructor() {
    super('/api')
  }

  /**
   * 测试调用动态接口
   */
  test = (params: SysDynamicApiTestExecParam) => {
    return this.post<Array<unknown>, SysDynamicApiTestExecParam>('test', params)
  }

  /**
   * GET调用动态接口，执行代码
   */
  apiForGet = (path: string, param: Record<string, unknown>) => {
    return this.get<Array<unknown>, Record<string, unknown>>(path, param)
  }

  /**
   * POST调用动态接口，执行代码
   */
  apiForPost = (path: string, param: Record<string, unknown>) => {
    return this.post<Array<unknown>, Record<string, unknown>>(path, param)
  }

  /**
   * PUT调用动态接口，执行代码
   */
  apiForPut = (path: string, param: Record<string, unknown>) => {
    return this.put<Array<unknown>, Record<string, unknown>>(path, param)
  }

  /**
   * DELETE调用动态接口，执行代码
   */
  apiForDelete = (path: string, param: Record<string, unknown>) => {
    return this.delete<Array<unknown>, Record<string, unknown>>(path, param)
  }

}

export default new SysDynamicApiApi()

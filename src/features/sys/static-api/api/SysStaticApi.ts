import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import SysStaticApiData from '../type/SysStaticApiData'
import type SysStaticApiParam from '../type/SysStaticApiParam'

class SysStaticApi extends BaseApi {
  constructor() {
    super('/sys/static-api')
  }

  // ============================== CRUD =================================>

  /**
   * 分页查询系统的API接口
   */
  page = (params: SysStaticApiParam & PageParam) => {
    return this.get<PageData<SysStaticApiData>, SysStaticApiParam & PageParam>('page', params)
  }
}

export default new SysStaticApi()

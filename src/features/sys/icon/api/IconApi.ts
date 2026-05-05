import BaseApi from '@/api/BaseApi'
import type PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import type SysIconParam from '../type/SysIconParam'
import SysIconData from '../type/SysIconData'

class IconApi extends BaseApi {
  constructor() {
    super('/sys/icon')
  }

  /**
   * 获取所有icon图标
   */
  list = () => {
    return this.get<SysIconData[]>('list')
  }

  /**
   * 分页查询系统图标库
   */
  page = (param: SysIconParam & PageParam) => {
    return this.get<PageData<SysIconData>, SysIconParam & PageParam>('page', param)
  }

  /**
   * 分页查询系统图标库
   */
  queryByCode = (code: string) => {
    return this.get<SysIconData, { code: string }>('queryByCode', {code})
  }
}

// 导出单例
export default new IconApi()

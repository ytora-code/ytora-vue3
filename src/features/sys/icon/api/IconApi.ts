import BaseApi from '@/api/BaseApi'
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
}

// 导出单例
export default new IconApi()

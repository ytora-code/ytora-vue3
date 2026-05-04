import BaseApi from '@/api/BaseApi'
import PageData from '@/types/PageData'
import type PageParam from '@/types/PageParam'
import OnlineUserParam from '@/features/monitor/online-user/type/OnlineUserParam'
import OnlineUserData from '@/features/monitor/online-user/type/OnlineUserData'

class SysOnlineUserApi extends BaseApi {
  constructor() {
    super('/monitor/online-user')
  }

  /**
   * 分页查询在线用户
   */
  page = (param: OnlineUserParam & PageParam) => {
    return this.get<PageData<OnlineUserData>, { param: OnlineUserParam & PageParam }>('page', {
      param,
    })
  }

  /**
   * 踢出在线用户
   */
  kickByTokens = (tokens: string) => {
    return this.delete<string, { tokens: string }>('kickByTokens', { tokens })
  }
}

export default new SysOnlineUserApi()

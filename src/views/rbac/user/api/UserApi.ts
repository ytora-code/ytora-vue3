import BaseApi from '@/api/BaseApi'
import type LoginReq from '@/types/req/LoginReq.ts'
import type SysUserResp from '@/views/rbac/user/type/resp/SysUserResp.ts'
import type PageResp from '@/types/resp/PageResp.ts'

class UserApi extends BaseApi {
  constructor() {
    super('/rbac/sysUser')
  }

  /**
   * 登录
   * @param loginReq 登录时携带的数据
   */
  page = () => {
    return this.get<PageResp<SysUserResp>>('page')
  }

}

// 导出单例
export const userApi = new UserApi()

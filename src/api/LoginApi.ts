import BaseApi from '@/api/BaseApi'
import type LoginReq from '@/types/req/LoginReq.ts'
import type LoginUserDetail from '@/types/resp/LoginUserDetail.ts'

class LoginApi extends BaseApi {
  constructor() {
    super('/sys')
  }

  /**
   * 登录
   * @param loginReq 登录时携带的数据
   */
  doLogin = (loginReq: LoginReq) => {
    return this.post<LoginUserDetail, LoginReq>('doLogin', loginReq)
  }

  /**
   * 根据token获取在线用户详情
   */
  getUserDetailByToken = () => {
    return this.get<LoginUserDetail>('queryDetailByToken')
  }

  /**
   * 退出
   */
  logout = () => {
    return this.get<string>('logout')
  }
}

// 导出单例
export const loginApi = new LoginApi()

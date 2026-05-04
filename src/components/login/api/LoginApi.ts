import BaseApi from '@/api/BaseApi'
import LoginParam from '../type/param/LoginParam'
import LoginUserDetail from '../type/LoginUserDetail'

class LoginApi extends BaseApi {
  constructor() {
    super('/sys')
  }

  /**
   * 登录
   * @param loginParam 登录时携带的数据
   */
  doLogin = (loginParam: LoginParam) => {
    return this.post<LoginUserDetail, LoginParam>('doLogin', loginParam)
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
  doLogout = () => {
    return this.get<string>('doLogout')
  }
}

// 导出单例
export default new LoginApi()

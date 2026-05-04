/**
 * 登录时提交的参数
 */
export default interface LoginParam {
  /**
   * 用户名
   */
  username: string

  /**
   * 登录密码
   */
  password: string

  /**
   * code
   */
  code?: string

  /**
   * UUID
   */
  captchaUUID?: string
}

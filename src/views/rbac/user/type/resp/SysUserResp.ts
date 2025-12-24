import type BaseResp from '@/types/resp/BaseResp.ts'

export default interface SysUserResp extends BaseResp<SysUserResp> {
  /**
   * 用户名
   */
  userName: string;
  /**
   * 真实姓名
   */
  realName: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 头像
   */
  avatar: string;
  /**
   * 电话
   */
  phone: string;
  /**
   * 邮箱
   */
  email: string;

  /**
   * 生日
   */
  birthday: string;

  /**
   * 证件号
   */
  idCard: string;
}

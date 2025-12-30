import type BaseReq from '@/types/req/BaseReq.ts'

/**
 * created by yangtong on 2024/3/24 11:21
 * 用户的实体类型
 */
export default interface SysRole extends BaseReq {
  /**
   * 角色名称
   */
  roleName: string
  /**
   * 角色编码
   */
  roleCode?: string

}

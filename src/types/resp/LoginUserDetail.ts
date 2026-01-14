import type SysPermission from '@/views/rbac/permission/type/resp/SysPermission.ts'
import type SysRole from '@/views/rbac/role/type/resp/SysRole.ts'

export default interface LoginUserDetail {
  /**
   * 用户id
   */
  id: string
  /**
   * 用户名
   */
  userName: string
  /**
   * 用户真实姓名
   */
  realName: string
  /**
   * 用户头像
   */
  avatar: string
  /**
   * 手机号
   */
  phone: string
  /**
   * 邮箱
   */
  email: string

  /**
   * 用户当前部门
   */
  departCode: string

  /**
   * 用户当前部门
   */
  departName: string

  /**
   * 备注
   */
  remark: string
  /**
   * 该用户角色
   */
  roles: SysRole[]
  /**
   * 该用户拥有菜单
   */
  menus: SysPermission[]

  /**
   * 该用户拥有 TABLE 组件
   */
  tables: SysPermission[]

  /**
   * 该用户拥有 FORM 组件
   */
  forms: SysPermission[]
}

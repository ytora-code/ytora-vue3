import SysPermissionData from '@/features/rbac/permission/type/SysPermissionData'

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
   * 该用户拥有菜单
   */
  menus: SysPermissionData[]

  /**
   * 该用户拥有 TABLE 组件
   */
  tables: SysPermissionData[]

  /**
   * 该用户拥有 FORM 组件
   */
  forms: SysPermissionData[]
}

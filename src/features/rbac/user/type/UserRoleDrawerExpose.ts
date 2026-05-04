import type SysUserData from '@/features/rbac/user/type/SysUserData'

export default interface UserRoleDrawerExpose {
  open: (user: SysUserData) => Promise<void>
}

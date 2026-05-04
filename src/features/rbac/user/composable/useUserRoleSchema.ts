import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysUserRoleData from '@/features/rbac/role/type/data/SysUserRoleData'
import type SysUserRoleMapperParam from '@/features/rbac/role/type/param/SysUserRoleMapperParam'

const useUserRoleSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysUserRoleMapperParam>[] = [
    {
      span: 8,
      label: '角色名称',
      type: 'input',
      dataKey: 'roleName',
      prop: {
        clearable: true,
        maxlength: 30,
      },
    },
    {
      span: 8,
      label: '角色编码',
      type: 'input',
      dataKey: 'roleCode',
      prop: {
        clearable: true,
        maxlength: 30,
      },
    },
  ]

  const tableSchemas: DynamicTableSchema<SysUserRoleData>[] = [
    { title: '角色名称', key: 'roleName', dataKey: 'roleName', minWidth: 160 },
    { title: '角色编码', key: 'roleCode', dataKey: 'roleCode', minWidth: 160 },
    {
      title: '备注',
      key: 'roleRemark',
      dataKey: 'roleRemark',
      minWidth: 220,
      ellipsis: true,
    },
    {
      title: '绑定状态',
      key: 'owner',
      type: 'slot',
      width: 140,
      fixed: 'right',
      align: 'center',
    },
  ]

  return {
    searchFormSchemas,
    tableSchemas,
  }
}

export default useUserRoleSchema

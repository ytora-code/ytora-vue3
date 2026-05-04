import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysRoleData from '../type/data/SysRoleData'
import type SysRoleParam from '../type/param/SysRoleParam'

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysRoleParam>[] = [
    {
      span: 5,
      label: '角色名称',
      type: 'input',
      dataKey: 'roleName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '角色编码',
      type: 'input',
      dataKey: 'roleCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerFormSchemas: DynamicFormSchema<SysRoleParam>[] = [
    {
      label: '角色名称',
      type: 'input',
      dataKey: 'roleName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '角色编码',
      type: 'input',
      dataKey: 'roleCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '角色备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        clearable: true,
      },
    },
  ]

  const drawerRules: FormRules = {}

  const tableSchemas: DynamicTableSchema<SysRoleData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '角色名称',
      key: 'roleName',
      dataKey: 'roleName',
      width: 160,
    },
    {
      title: '角色编码',
      key: 'roleCode',
      dataKey: 'roleCode',
      width: 160,
    },
    {
      title: '角色备注',
      key: 'remark',
      dataKey: 'remark',
      width: 220,
    },
    { title: '操作', key: 'action', type: 'slot', width: 220, fixed: 'right' },
  ]

  return {
    searchFormSchemas,
    drawerFormSchemas,
    drawerRules,
    tableSchemas,
  }
}

export default useSchema

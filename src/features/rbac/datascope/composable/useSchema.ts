import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysRoleDataScopeData from '../type/SysRoleDataScopeData'
import type SysRoleDataScopeParam from '../type/SysRoleDataScopeParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {
  /**
   * 条件搜索框的结构
   */
  const searchFormSchemas: DynamicFormSchema<SysRoleDataScopeParam>[] = [
    {
      span: 5,
      label: '角色ID',
      type: 'input',
      dataKey: 'roleId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '数据规则ID',
      type: 'input',
      dataKey: 'scopeId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  /**
   * 新增/编辑表单的结构
   */
  const drawerFormSchemas: DynamicFormSchema<SysRoleDataScopeParam>[] = [
    {
      label: '角色ID',
      type: 'input',
      dataKey: 'roleId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '数据规则ID',
      type: 'input',
      dataKey: 'scopeId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  /**
   * 新增/编辑表单的校验规则
   */
  const drawerRules: FormRules = {}

  /**
   * 数据表格的结构
   */
  const tableSchemas: DynamicTableSchema<SysRoleDataScopeData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '角色ID',
      key: 'roleId',
      dataKey: 'roleId',
      width: 160,
    },
    {
      title: '数据规则ID',
      key: 'scopeId',
      dataKey: 'scopeId',
      width: 160,
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

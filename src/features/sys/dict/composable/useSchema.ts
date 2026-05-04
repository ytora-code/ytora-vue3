import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysDictData from '../type/SysDictData'
import type SysDictParam from '../type/SysDictParam'

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysDictParam>[] = [
    {
      span: 6,
      label: '字典名称',
      type: 'input',
      dataKey: 'dictName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 6,
      label: '字典编码',
      type: 'input',
      dataKey: 'dictCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerFormSchemas: DynamicFormSchema<SysDictParam>[] = [
    {
      label: '字典名称',
      type: 'input',
      dataKey: 'dictName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '字典编码',
      type: 'input',
      dataKey: 'dictCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '字典备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '排序',
      type: 'input-number',
      dataKey: 'index',
      prop: {
        clearable: true,
      },
    },
  ]

  const drawerRules: FormRules = {}

  const tableSchemas: DynamicTableSchema<SysDictData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '字典名称',
      key: 'dictName',
      dataKey: 'dictName',
      width: 160,
    },
    {
      title: '字典编码',
      key: 'dictCode',
      dataKey: 'dictCode',
      width: 160,
    },

    {
      title: '排序',
      key: 'index',
      dataKey: 'index',
      type: 'number',
      width: 60,
    },

    {
      title: '字典备注',
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

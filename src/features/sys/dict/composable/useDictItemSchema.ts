import { type FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysDictItemData from '../type/SysDictItemData'
import type SysDictItemParam from '../type/SysDictItemParam'

const useDictItemSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysDictItemParam>[] = [
    {
      span: 8,
      label: '文本',
      type: 'input',
      dataKey: 'itemText',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerFormSchemas: DynamicFormSchema<SysDictItemParam>[] = [
    {
      label: '字典项值',
      type: 'input',
      dataKey: 'itemValue',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '字典项文本',
      type: 'input',
      dataKey: 'itemText',
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
    {
      label: '备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        clearable: true,
        maxlength: 200,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
  ]

  const drawerRules: FormRules = {
    itemValue: [
      {
        required: true,
        message: '请输入字典项值',
        trigger: ['input', 'blur'],
      },
    ],
    itemText: [
      {
        required: true,
        message: '请输入字典项文本',
        trigger: ['input', 'blur'],
      },
    ],
  }

  const tableSchemas: DynamicTableSchema<SysDictItemData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '字典项值',
      key: 'itemValue',
      dataKey: 'itemValue',
      width: 160,
    },
    {
      title: '字典项文本',
      key: 'itemText',
      dataKey: 'itemText',
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
      title: '备注',
      key: 'remark',
      dataKey: 'remark',
      width: 220,
    },
    { title: '操作', key: 'action', type: 'slot', width: 160, fixed: 'right' },
  ]

  return {
    searchFormSchemas,
    drawerFormSchemas,
    drawerRules,
    tableSchemas,
  }
}

export default useDictItemSchema

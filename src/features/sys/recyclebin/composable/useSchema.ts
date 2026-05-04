import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysRecycleBinData from '../type/SysRecycleBinData'
import type SysRecycleBinParam from '../type/SysRecycleBinParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {
  /**
   * 条件搜索框的结构
   */
  const searchFormSchemas: DynamicFormSchema<SysRecycleBinParam>[] = [
    {
      span: 5,
      label: '删除人',
      type: 'input',
      dataKey: 'deletedBy',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '删除时间',
      type: 'input',
      dataKey: 'deletedTime',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '删除原因',
      type: 'input',
      dataKey: 'deleteReason',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '原始表',
      type: 'input',
      dataKey: 'originalTable',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  /**
   * 新增/编辑表单的结构
   */
  const drawerFormSchemas: DynamicFormSchema<SysRecycleBinParam>[] = [
    {
      label: '删除人',
      type: 'input',
      dataKey: 'deletedBy',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '删除时间',
      type: 'input',
      dataKey: 'deletedTime',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '删除原因',
      type: 'input',
      dataKey: 'deleteReason',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '原始表',
      type: 'input',
      dataKey: 'originalTable',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '原始数据id',
      type: 'input',
      dataKey: 'originalId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '原始数据，JSON',
      type: 'input',
      dataKey: 'originalData',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: 'redo,还原SQL',
      type: 'input',
      dataKey: 'restoreSql',
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
  const tableSchemas: DynamicTableSchema<SysRecycleBinData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '删除人',
      key: 'deletedBy',
      dataKey: 'deletedBy',
      width: 160,
    },
    {
      title: '删除时间',
      key: 'deletedTime',
      dataKey: 'deletedTime',
      type: 'date',
      width: 140,
    },
    {
      title: '删除原因',
      key: 'deleteReason',
      dataKey: 'deleteReason',
      width: 160,
    },
    {
      title: '原始表',
      key: 'originalTable',
      dataKey: 'originalTable',
      width: 160,
    },
    {
      title: '原始数据id',
      key: 'originalId',
      dataKey: 'originalId',
      width: 160,
    },
    {
      title: '原始数据，JSON',
      key: 'originalData',
      dataKey: 'originalData',
      width: 160,
    },
    {
      title: 'redo,还原SQL',
      key: 'restoreSql',
      dataKey: 'restoreSql',
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

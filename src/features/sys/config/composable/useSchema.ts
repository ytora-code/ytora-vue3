import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysConfigData from '../type/SysConfigData'
import type SysConfigParam from '../type/SysConfigParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {
  /**
   * 条件搜索框的结构
   */
  const searchFormSchemas: DynamicFormSchema<SysConfigParam>[] = [
    {
      span: 5,
      label: '配置名称',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '键',
      type: 'input',
      dataKey: 'key',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },

    {
      span: 5,
      label: '配置类型',
      type: 'input',
      dataKey: 'type',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  /**
   * 新增/编辑表单的结构
   */
  const drawerFormSchemas: DynamicFormSchema<SysConfigParam>[] = [
    {
      label: '配置名称',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '键',
      type: 'input',
      dataKey: 'key',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '值',
      type: 'input',
      dataKey: 'value',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '配置类型',
      type: 'input',
      dataKey: 'type',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '是否启用',
      type: 'select',
      dataKey: 'status',
      prop: {
        options: [
          { label: '正常', value: 1 },
          { label: '禁用', value: 2 },
        ],
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
  const tableSchemas: DynamicTableSchema<SysConfigData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '配置名称',
      key: 'name',
      dataKey: 'name',
      width: 160,
    },
    {
      title: '键',
      key: 'key',
      dataKey: 'key',
      width: 160,
    },
    {
      title: '值',
      key: 'value',
      dataKey: 'value',
      width: 160,
    },
    {
      title: '配置类型',
      key: 'type',
      dataKey: 'type',
      width: 160,
    },
    {
      title: '是否启用',
      key: 'status',
      dataKey: 'status',
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

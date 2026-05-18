import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type BizDeployData from '../type/BizDeployData'
import type BizDeployParam from '../type/BizDeployParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {

  /**
   * 条件搜索框的结构
   */
  const searchFormSchemas: DynamicFormSchema<BizDeployParam>[] = [
    {
      span: 5,
      label: '姓名',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '身份证',
      type: 'input',
      dataKey: 'idCard',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '专业方向',
      type: 'input',
      dataKey: 'professional',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },

  ]

  /**
   * 新增/编辑表单的结构
   */
  const drawerFormSchemas: DynamicFormSchema<BizDeployParam>[] = [
    {
      label: '姓名',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '身份证',
      type: 'input',
      dataKey: 'idCard',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '专业方向',
      type: 'input',
      dataKey: 'professional',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '状态',
      type: 'select',
      dataKey: 'status',
      prop: {
        options: [
          { label: '正常', value: 1 },
          { label: '禁用', value: 2 },
        ],
      },
    }
  ]

  /**
   * 新增/编辑表单的校验规则
   */
  const drawerRules: FormRules = {}

  /**
   * 数据表格的结构
   */
  const tableSchemas: DynamicTableSchema<BizDeployData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '姓名',
      key: 'name',
      dataKey: 'name',
      width: 160,
    },
    {
      title: '身份证',
      key: 'idCard',
      dataKey: 'idCard',
      width: 160,
    },
    {
      title: '专业方向',
      key: 'professional',
      dataKey: 'professional',
      width: 160,
    },
    {
      title: '状态',
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

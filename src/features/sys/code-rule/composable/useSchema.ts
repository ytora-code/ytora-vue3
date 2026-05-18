import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysCodeRuleData from '../type/SysCodeRuleData'
import type SysCodeRuleParam from '../type/SysCodeRuleParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {

  /**
   * 条件搜索框的结构
   */
  const searchFormSchemas: DynamicFormSchema<SysCodeRuleParam>[] = [
    {
      span: 5,
      label: '规则编码',
      type: 'input',
      dataKey: 'ruleCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 5,
      label: '规则名称',
      type: 'input',
      dataKey: 'ruleName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  /**
   * 新增/编辑表单的结构
   */
  const drawerFormSchemas: DynamicFormSchema<SysCodeRuleParam>[] = [
    {
      label: '规则编码',
      type: 'input',
      dataKey: 'ruleCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '规则名称',
      type: 'input',
      dataKey: 'ruleName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '编码模板',
      type: 'input',
      dataKey: 'ruleTemplate',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: 'seq流水起始值',
      type: 'input',
      dataKey: 'seqStart',
      prop: {
        clearable: true,

      },
    },
    {
      label: 'seq流水步长',
      type: 'input',
      dataKey: 'seqStep',
      prop: {
        clearable: true,

      },
    },
    {
      label: '日期时区',
      type: 'input',
      dataKey: 'timezone',
      prop: {
        clearable: true,
        maxlength: 100,
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
  const tableSchemas: DynamicTableSchema<SysCodeRuleData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '规则编码',
      key: 'ruleCode',
      dataKey: 'ruleCode',
      width: 160,
    },
    {
      title: '规则名称',
      key: 'ruleName',
      dataKey: 'ruleName',
      width: 160,
    },
    {
      title: '编码模板',
      key: 'ruleTemplate',
      dataKey: 'ruleTemplate',
      width: 160,
    },
    {
      title: 'seq流水起始值',
      key: 'seqStart',
      dataKey: 'seqStart',
      width: 160,
    },
    {
      title: 'seq流水步长',
      key: 'seqStep',
      dataKey: 'seqStep',
      width: 160,
    },
    {
      title: '当前seq',
      key: 'currentSeq',
      dataKey: 'currentSeq',
      width: 160,
      emptyText: '-'
    },
    {
      title: '日期时区',
      key: 'timezone',
      dataKey: 'timezone',
      type: 'date',
      width: 140,
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

import { h } from 'vue'
import { NTag, type FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysDynamicApiData from '../type/SysDynamicApiData'
import type SysDynamicApiParam from '../type/SysDynamicApiParam'

/**
 * 表单和表格的结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysDynamicApiParam>[] = [
    {
      span: 8,
      label: '接口URI',
      type: 'input',
      dataKey: 'uri',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 8,
      label: '接口名称',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const basicFormSchemas: DynamicFormSchema<SysDynamicApiParam>[] = [
    {
      label: '接口URI',
      type: 'input',
      dataKey: 'uri',
      prop: {
        clearable: true,
        maxlength: 100,
        placeholder: '请输入接口URI，例如 /user/list',
      },
    },
    {
      label: '请求方式',
      type: 'dict',
      dictCode: 'HTTP_METHOD',
      dataKey: 'method',
      prop: {
        clearable: true,
        placeholder: '请选择请求方式',
      },
    },
    {
      label: '接口名称',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
        placeholder: '请输入接口名称',
      },
    },
    {
      label: '接口类型',
      type: 'dict',
      dictCode: 'API_TYPE',
      dataKey: 'type',
      prop: {
        clearable: true,
        placeholder: '请选择接口类型',
      },
    },
    {
      label: '接口状态',
      type: 'dict',
      dictCode: 'API_STATUS',
      dataKey: 'status',
      prop: {
        clearable: true,
        placeholder: '请选择接口状态',
      },
    },
    {
      label: '备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        clearable: true,
        placeholder: '请选择接口状态',
      },
    },
  ]

  const codeFormSchemas: DynamicFormSchema<SysDynamicApiParam>[] = [
    {
      span: 12,
      label: '最多查询条数',
      type: 'input-number',
      dataKey: 'max',
      prop: {
        min: 1,
        max: 10000,
        step: 1,
        placeholder: '请输入最多查询条数',
      },
    },
    {
      span: 12,
      label: '是否开启事务',
      type: 'switch',
      dataKey: 'transactional',
    },
  ]

  const basicFormRules: FormRules = {
    uri: [{ required: true, message: '请输入接口URI', trigger: ['input', 'blur'] }],
    method: [{ required: true, type: 'number', message: '请选择请求方式', trigger: ['change'] }],
    name: [{ required: true, message: '请输入接口名称', trigger: ['input', 'blur'] }],
    type: [{ required: true, message: '请选择接口类型', trigger: ['change'] }],
  }

  const codeFormRules: FormRules = {
    max: [{ required: true, type: 'number', message: '请输入最多查询条数', trigger: ['blur'] }],
  }

  const tableSchemas: DynamicTableSchema<SysDynamicApiData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '接口URI',
      key: 'uri',
      dataKey: 'uri',
      minWidth: 220,
      ellipsis: true,
    },
    {
      title: '请求方式',
      key: 'method',
      dataKey: 'method',
      type: 'dict',
      dictCode: 'HTTP_METHOD',
      width: 120,
    },
    {
      title: '接口名称',
      key: 'name',
      dataKey: 'name',
      minWidth: 180,
      ellipsis: true,
    },
    {
      title: '接口类型',
      key: 'type',
      dataKey: 'type',
      type: 'dict',
      dictCode: 'API_TYPE',
      width: 140,
    },
    {
      title: '内容摘要',
      key: 'content',
      dataKey: 'content',
      minWidth: 280,
      ellipsis: true,
    },
    {
      title: '事务',
      key: 'transactional',
      dataKey: 'transactional',
      width: 100,
      render: ({ row }) =>
        h(
          NTag,
          {
            type: row.transactional ? 'success' : 'default',
            bordered: false,
          },
          { default: () => (row.transactional ? '开启' : '关闭') },
        ),
    },
    {
      title: '状态',
      key: 'status',
      dataKey: 'status',
      type: 'dict',
      dictCode: 'API_STATUS',
      width: 120,
    },
    { title: '操作', key: 'action', type: 'slot', width: 280, fixed: 'right' },
  ]

  return {
    searchFormSchemas,
    basicFormSchemas,
    codeFormSchemas,
    basicFormRules,
    codeFormRules,
    tableSchemas,
  }
}

export default useSchema

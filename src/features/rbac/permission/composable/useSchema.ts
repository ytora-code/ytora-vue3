import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type SysPermissionParam from '../type/SysPermissionParam'

const PERMISSION_TYPE_OPTIONS = [
  { label: '接口', value: 1 },
  { label: '页面', value: 2 },
  { label: '页面元素', value: 3 },
]

/**
 * 资源表单结构
 */
const useSchema = () => {
  const permissionFormSchemas: DynamicFormSchema<SysPermissionParam>[] = [
    {
      span: 12,
      label: '菜单名称',
      type: 'input',
      dataKey: 'permissionName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 12,
      label: '资源类型',
      type: 'select',
      dataKey: 'permissionType',
      prop: {
        clearable: true,
        options: PERMISSION_TYPE_OPTIONS,
      },
    },
    {
      span: 12,
      label: '资源编码',
      type: 'input',
      dataKey: 'permissionCode',
      placeholder: '页面类型时填写路由，编码需全局唯一',
      prop: {
        clearable: true,
        maxlength: 200,
      },
    },
    {
      span: 12,
      label: '前端组件',
      type: 'input',
      dataKey: 'component',
      prop: {
        clearable: true,
        maxlength: 200,
      },
    },
    {
      span: 12,
      label: '图标',
      type: 'input',
      dataKey: 'icon',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 12,
      label: '重定向',
      type: 'input',
      dataKey: 'redirect',
      prop: {
        clearable: true,
        maxlength: 200,
      },
    },
    {
      span: 12,
      label: '是否可见',
      type: 'switch',
      dataKey: 'visible',
    },
    {
      span: 12,
      label: '排序',
      type: 'input-number',
      dataKey: 'index',
      prop: {
        clearable: true,
        min: 0,
        precision: 0,
      },
    },
    {
      span: 24,
      label: '元数据',
      type: 'textarea',
      dataKey: 'meta',
      prop: {
        clearable: true,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
    {
      span: 24,
      label: '备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        clearable: true,
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
  ]

  const permissionFormRules: FormRules = {
    permissionName: [
      {
        required: true,
        message: '请输入菜单名称',
        trigger: ['input', 'blur'],
      },
    ],
    permissionCode: [
      {
        required: true,
        message: '请输入资源编码',
        trigger: ['input', 'blur'],
      },
    ],
  }

  return {
    permissionFormSchemas,
    permissionFormRules,
  }
}

export { PERMISSION_TYPE_OPTIONS }
export default useSchema

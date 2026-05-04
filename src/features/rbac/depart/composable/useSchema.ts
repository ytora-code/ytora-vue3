import { h } from 'vue'
import { NInput, type FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysDepartParam from '../type/SysDepartParam'
import type SysUserData from '@/features/rbac/user/type/SysUserData'

const DEPART_TYPE_OPTIONS = [
  { label: '主体', value: 'ROOT' },
  { label: '部门', value: 'depart' },
  { label: '岗位', value: 'position' },
]

interface DepartFormSchemaOptions {
  showDepartCode?: boolean
  disableDepartCode?: boolean
  contactName?: string
  openContactPicker?: () => void
  clearContact?: () => void
}

const useSchema = () => {
  const createDepartFormSchemas = (
    options: DepartFormSchemaOptions = {},
  ): DynamicFormSchema<SysDepartParam>[] => [
    {
      span: 12,
      label: options.showDepartCode ? '主体名称' : '部门名称',
      type: 'input',
      dataKey: 'departName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 12,
      label: '部门编码',
      type: 'input',
      dataKey: 'departCode',
      hidden: options.showDepartCode === false,
      disabled: options.disableDepartCode === true,
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 12,
      label: '类型',
      type: 'select',
      dataKey: 'type',
      prop: {
        clearable: true,
        options: DEPART_TYPE_OPTIONS,
      },
    },
    {
      span: 12,
      label: '部门负责人',
      type: 'input',
      dataKey: 'contactId',
      render: () =>
        h(NInput, {
          value: options.contactName ?? '',
          placeholder: '点击选择部门负责人',
          readonly: true,
          clearable: !!(options.contactName ?? '').trim(),
          onClick: options.openContactPicker,
          onClear: options.clearContact,
        }),
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

  const createDepartFormRules = (options: DepartFormSchemaOptions = {}): FormRules => ({
    departName: [
      {
        required: true,
        message: '请输入部门名称',
        trigger: ['input', 'blur'],
      },
    ],
    ...(options.showDepartCode === false
      ? {}
      : {
          departCode: [
            {
              required: true,
              message: '请输入部门编码',
              trigger: ['input', 'blur'],
            },
          ],
        }),
    contactId: [
      {
        required: true,
        message: '请选择部门负责人',
        trigger: ['change', 'blur'],
      },
    ],
  })

  const userTableSchemas: DynamicTableSchema<SysUserData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '头像',
      key: 'avatar',
      dataKey: 'avatar',
      type: 'image',
      width: 88,
      imageWidth: 40,
      imageHeight: 40,
    },
    { title: '账号', key: 'userName', dataKey: 'userName', width: 140 },
    { title: '姓名', key: 'realName', dataKey: 'realName', width: 140 },
    { title: '主部门', key: 'departCode', dataKey: 'departCode_DICT', width: 140 },
    { title: '电话', key: 'phone', dataKey: 'phone', width: 140 },
    { title: '邮箱', key: 'email', dataKey: 'email', width: 180 },
    { title: '备注', key: 'remark', dataKey: 'remark', width: 180 },
    { title: '操作', key: 'action', type: 'slot', width: 120, fixed: 'right' },
  ]

  const bindUserTableSchemas: DynamicTableSchema<SysUserData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '头像',
      key: 'avatar',
      dataKey: 'avatar',
      type: 'image',
      width: 88,
      imageWidth: 40,
      imageHeight: 40,
    },
    { title: '账号', key: 'userName', dataKey: 'userName', width: 140 },
    { title: '姓名', key: 'realName', dataKey: 'realName', width: 140 },
    { title: '电话', key: 'phone', dataKey: 'phone', width: 140 },
    { title: '邮箱', key: 'email', dataKey: 'email', width: 180 },
  ]

  return {
    bindUserTableSchemas,
    createDepartFormSchemas,
    createDepartFormRules,
    userTableSchemas,
  }
}

export { DEPART_TYPE_OPTIONS }
export default useSchema

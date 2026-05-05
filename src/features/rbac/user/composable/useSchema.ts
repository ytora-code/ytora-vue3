import { computed, ref } from 'vue'
import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import { FormRules, NTag } from 'naive-ui'

import departApi from '@/features/rbac/depart/api/SysDepartApi'
import type SysDepartData from '@/features/rbac/depart/type/SysDepartData'
import type SysUserData from '@/features/rbac/user/type/SysUserData'
import type SysUserParam from '@/features/rbac/user/type/SysUserParam'

/**
 * 产生表单和表格结构
 */
const useFormSchema = () => {
  const drawerDepartOptions = ref<Array<{ label: string; value: string }>>([])
  const drawerModel = ref<SysUserParam>({})

  /**
   * 条件搜索框的表单结构
   */
  const searchFormSchemas: DynamicFormSchema<SysUserParam>[] = [
    {
      span: 5,
      label: '用户名称',
      type: 'input',
      dataKey: 'userName',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      span: 5,
      label: '真实名称',
      type: 'input',
      dataKey: 'realName',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      span: 5,
      label: '电话号码',
      type: 'input',
      dataKey: 'phone',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      span: 5,
      label: '状态',
      type: 'dict',
      dataKey: 'status',
      dictCode: 'user_status',
    },
  ]

  /**
   * 新增或编辑抽屉的表单接口
   */
  const loadDrawerFormSchemas = async (model: SysUserParam) => {
    drawerModel.value = { ...model }

    if (!model.id) {
      drawerDepartOptions.value = []
      return
    }

    const departs: Array<SysDepartData> = await departApi.listDepartByUserId(model.id)
    drawerDepartOptions.value = departs.map((item) => ({
      label: item.departName ?? '',
      value: item.departCode ?? '',
    }))
  }

  const drawerFormSchemas = computed<DynamicFormSchema<SysUserParam>[]>(() => [
    {
      label: '用户名称',
      type: 'input',
      dataKey: 'userName',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      label: '真实名称',
      type: 'input',
      dataKey: 'realName',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      label: '部门',
      type: 'select',
      dataKey: 'departCode',
      hidden: !drawerModel.value.id,
      prop: {
        options: drawerDepartOptions.value,
      },
    },

    {
      label: '状态',
      type: 'dict',
      dataKey: 'status',
      dictCode: 'user_status',
    },
    {
      label: '电话号码',
      type: 'input',
      dataKey: 'phone',
      prop: {
        clearable: true,
        maxlength: 20,
      },
    },
    {
      label: '邮箱',
      type: 'input',
      dataKey: 'email',
      prop: {
        clearable: true,
        maxlength: 50,
      },
    },
    {
      label: '生日',
      type: 'input',
      dataKey: 'birthday',
      prop: {
        clearable: true,
      },
    },
    {
      label: '证件号',
      type: 'input',
      dataKey: 'idCard',
      prop: {
        clearable: true,
        maxlength: 32,
      },
    },
    {
      label: '备注',
      type: 'textarea',
      dataKey: 'remark',
      prop: {
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
  ])

  /**
   * 新增或编辑表单的校验规则
   */
  const drawerRules: FormRules = {
    userName: [{ required: true, message: '请输入用户名称', trigger: ['input', 'blur'] }],
    realName: [{ required: true, message: '请输入真实名称', trigger: ['input', 'blur'] }],
    phone: [{ required: true, message: '请输入电话号码', trigger: ['input', 'blur'] }],
    status: [
      { required: true, type: 'number', message: '请选择状态', trigger: ['change', 'blur'] },
    ],
  }

  /**
   * 数据表格的列结构
   */
  const tableSchemas: DynamicTableSchema<SysUserData>[] = [
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
    { title: '邮箱', key: 'email', dataKey: 'email', width: 140 },
    { title: '生日', key: 'birthday', dataKey: 'birthday', type: 'date', width: 120 },
    { title: '证件号', key: 'idCard', dataKey: 'idCard', width: 120 },
    {
      title: '状态',
      key: 'status',
      dataKey: 'status',
      width: 120,
      render: ({ row }) => {
        const enabled = row.status === 1
        return h(
          NTag,
          { type: enabled ? 'success' : 'error' },
          { default: () => (enabled ? '启用' : '停用') },
        )
      },
    },
    { title: '备注', key: 'remark', dataKey: 'remark', width: 200 },
    { title: '操作', key: 'action', type: 'slot', width: 280, fixed: 'right' },
  ]

  return {
    searchFormSchemas,
    drawerFormSchemas,
    loadDrawerFormSchemas,
    drawerRules,
    tableSchemas,
  }
}
export default useFormSchema

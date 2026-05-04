import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysSchedulerTaskData from '../type/SysSchedulerTaskData'
import type SysSchedulerTaskParam from '../type/SysSchedulerTaskParam'

import { NTag } from 'naive-ui'

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysSchedulerTaskParam>[] = [
    {
      span: 6,
      label: '任务名称',
      type: 'input',
      dataKey: 'taskName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 6,
      label: '任务code',
      type: 'input',
      dataKey: 'taskCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerFormSchemas: DynamicFormSchema<SysSchedulerTaskParam>[] = [
    {
      label: '任务名称',
      type: 'input',
      dataKey: 'taskName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '任务code',
      type: 'input',
      dataKey: 'taskCode',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: 'CRON',
      type: 'input',
      dataKey: 'cron',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '任务类型',
      type: 'input',
      dataKey: 'type',
      prop: {
        clearable: true,
      },
    },
    {
      label: '任务参数',
      type: 'input',
      dataKey: 'params',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '任务状态',
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

  const drawerRules: FormRules = {}

  const tableSchemas: DynamicTableSchema<SysSchedulerTaskData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },

    {
      title: '任务名称',
      key: 'taskName',
      dataKey: 'taskName',
      width: 160,
    },
    {
      title: '任务code',
      key: 'taskCode',
      dataKey: 'taskCode',
      width: 160,
    },
    {
      title: 'CRON',
      key: 'cron',
      dataKey: 'cron',
      width: 160,
    },
    {
      title: '任务类型',
      key: 'type',
      dataKey: 'type',
      width: 160,
    },
    {
      title: '任务参数',
      key: 'params',
      dataKey: 'params',
      width: 160,
    },
    {
      title: '任务状态',
      key: 'status',
      dataKey: 'status',
      type: 'tag',
      render: ({ row }) => {
        const enabled = row.status === 1
        return h(
          NTag,
          { type: enabled ? 'success' : 'error' },
          { default: () => (enabled ? '启用' : '停用') },
        )
      },
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

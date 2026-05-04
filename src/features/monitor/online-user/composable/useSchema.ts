import type DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type OnlineUserData from '../type/OnlineUserData'
import type OnlineUserParam from '../type/OnlineUserParam'

const formatTimestamp = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const timestamp = Number(value)
  if (!Number.isFinite(timestamp)) {
    return String(value)
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<OnlineUserParam>[] = [
    {
      span: 6,
      label: '用户名',
      type: 'input',
      dataKey: 'userName',
      prop: {
        clearable: true,
        maxlength: 50,
      },
    },
    {
      span: 6,
      label: '真实姓名',
      type: 'input',
      dataKey: 'realName',
      prop: {
        clearable: true,
        maxlength: 50,
      },
    },
  ]

  const tableSchemas: DynamicTableSchema<OnlineUserData>[] = [
    { type: 'selection', key: 'selection', width: 48, fixed: 'left' },
    {
      title: '用户名',
      key: 'userName',
      dataKey: 'userName',
      width: 140,
    },
    {
      title: '真实姓名',
      key: 'realName',
      dataKey: 'realName',
      width: 140,
    },
    {
      title: 'IP',
      key: 'ip',
      dataKey: 'ip',
      width: 180,
    },
    {
      title: '部门编码',
      key: 'departCode',
      dataKey: 'departCode',
      width: 160,
    },
    {
      title: '登录时间',
      key: 'loginTime',
      dataKey: 'loginTime',
      width: 180,
      formatter: (value) => formatTimestamp(value),
    },
    {
      title: '最后请求时间',
      key: 'lastRequestTime',
      dataKey: 'lastRequestTime',
      width: 180,
      formatter: (value) => formatTimestamp(value),
    },
    {
      title: '请求次数',
      key: 'requestCount',
      dataKey: 'requestCount',
      type: 'number',
      width: 100,
    },

    {
      title: 'Token',
      key: 'token',
      dataKey: 'token',
      width: 240,
    },
    { title: '操作', key: 'action', type: 'slot', width: 120, fixed: 'right' },
  ]

  return {
    searchFormSchemas,
    tableSchemas,
  }
}

export default useSchema

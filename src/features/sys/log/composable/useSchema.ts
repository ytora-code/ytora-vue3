import type { FormRules } from 'naive-ui'

import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysLogData from '../type/SysLogData'
import type SysLogParam from '../type/SysLogParam'

export type SysLogType =
  | 'NORMAL_LOG'
  | 'REQUEST_LOG'
  | 'LOGIN_LOG'
  | 'SCHEDULE_TASK_LOG'
  | 'ERROR_LOG'

const createTime: DynamicTableSchema<SysLogData> = {
  title: '操作时间',
  type: 'date',
  key: 'createTime',
  dataKey: 'createTime',
  width: 120,
}

const createBy: DynamicTableSchema<SysLogData> = {
  title: '操作人',
  key: 'createBy',
  dataKey: 'createBy',
  width: 120,
}

const commonColumns = {
  type: {
    title: '日志类型',
    key: 'type',
    dataKey: 'type',
    width: 160,
  } satisfies DynamicTableSchema<SysLogData>,
  traceId: {
    title: '链路跟踪 ID',
    key: 'traceId',
    dataKey: 'traceId',
    width: 180,
  } satisfies DynamicTableSchema<SysLogData>,
  thread: {
    title: '所在线程信息',
    key: 'thread',
    dataKey: 'thread',
    width: 180,
  } satisfies DynamicTableSchema<SysLogData>,
  happenPlace: {
    title: '日志发生的位置',
    key: 'happenPlace',
    dataKey: 'happenPlace',
    width: 220,
  } satisfies DynamicTableSchema<SysLogData>,
  content: {
    title: '内容',
    key: 'content',
    dataKey: 'content',
    width: 240,
  } satisfies DynamicTableSchema<SysLogData>,
  paramLength: {
    title: '参数大小',
    key: 'paramLength',
    dataKey: 'paramLength',
    width: 120,
  } satisfies DynamicTableSchema<SysLogData>,
  params: {
    title: '参数',
    key: 'params',
    dataKey: 'params',
    width: 220,
  } satisfies DynamicTableSchema<SysLogData>,
  resultLength: {
    title: '返回值大小',
    key: 'resultLength',
    dataKey: 'resultLength',
    width: 120,
  } satisfies DynamicTableSchema<SysLogData>,
  result: {
    title: '返回值',
    key: 'result',
    dataKey: 'result',
    width: 220,
  } satisfies DynamicTableSchema<SysLogData>,
  cost: {
    title: '方法耗时',
    key: 'cost',
    dataKey: 'cost',
    width: 120,
  } satisfies DynamicTableSchema<SysLogData>,
  ip: {
    title: '操作人ip',
    key: 'ip',
    dataKey: 'ip',
    width: 160,
  } satisfies DynamicTableSchema<SysLogData>,
  requestUrl: {
    title: 'HTTP 请求路径',
    key: 'requestUrl',
    dataKey: 'requestUrl',
    width: 220,
  } satisfies DynamicTableSchema<SysLogData>,
  errorStack: {
    title: '错误堆栈信息',
    key: 'errorStack',
    dataKey: 'errorStack',
    width: 260,
  } satisfies DynamicTableSchema<SysLogData>,
}

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysLogParam>[] = [
    {
      span: 6,
      label: '链路跟踪ID',
      type: 'input',
      dataKey: 'traceId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 6,
      label: '日志内容',
      type: 'input',
      dataKey: 'content',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerFormSchemas: DynamicFormSchema<SysLogParam>[] = [
    {
      label: '日志类型',
      type: 'input',
      dataKey: 'type',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '链路跟踪 ID，用于聚合同一次调用的所有日志',
      type: 'input',
      dataKey: 'traceId',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '所在线程信息',
      type: 'input',
      dataKey: 'thread',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '日志发生的位置',
      type: 'input',
      dataKey: 'happenPlace',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '日志主体内容',
      type: 'textarea',
      dataKey: 'content',
      prop: {
        autosize: {
          minRows: 3,
          maxRows: 5,
        },
      },
    },
    {
      label: '参数大小',
      type: 'input',
      dataKey: 'paramLength',
      prop: {
        clearable: true,
      },
    },
    {
      label: '参数',
      type: 'input',
      dataKey: 'params',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '返回值大小',
      type: 'input',
      dataKey: 'resultLength',
      prop: {
        clearable: true,
      },
    },
    {
      label: '返回值',
      type: 'input',
      dataKey: 'result',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '方法耗时',
      type: 'input',
      dataKey: 'cost',
      prop: {
        clearable: true,
      },
    },
    {
      label: '操作人ip',
      type: 'input',
      dataKey: 'ip',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: 'HTTP 请求路径',
      type: 'input',
      dataKey: 'requestUrl',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      label: '错误堆栈信息',
      type: 'input',
      dataKey: 'errorStack',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
  ]

  const drawerRules: FormRules = {}

  const normalLogTableSchemas: DynamicTableSchema<SysLogData>[] = [
    createTime,
    createBy,
    commonColumns.traceId,
    commonColumns.thread,
    commonColumns.happenPlace,
    commonColumns.content,
    commonColumns.cost,
  ]

  const requestLogTableSchemas: DynamicTableSchema<SysLogData>[] = [
    createTime,
    createBy,
    commonColumns.traceId,
    commonColumns.requestUrl,
    commonColumns.params,
    commonColumns.result,
    commonColumns.cost,
    commonColumns.ip,
  ]

  const loginLogTableSchemas: DynamicTableSchema<SysLogData>[] = [
    createTime,
    createBy,
    commonColumns.ip,
    commonColumns.content,
  ]

  const scheduleTaskLogTableSchemas: DynamicTableSchema<SysLogData>[] = [
    createTime,
    createBy,
    commonColumns.traceId,
    commonColumns.happenPlace,
    commonColumns.content,
    commonColumns.params,
    commonColumns.result,
    commonColumns.cost,
  ]

  const errorLogTableSchemas: DynamicTableSchema<SysLogData>[] = [
    createTime,
    createBy,
    commonColumns.traceId,
    commonColumns.happenPlace,
    commonColumns.content,
    commonColumns.errorStack,
    commonColumns.params,
    commonColumns.ip,
  ]

  return {
    searchFormSchemas,
    drawerFormSchemas,
    drawerRules,
    normalLogTableSchemas,
    requestLogTableSchemas,
    loginLogTableSchemas,
    scheduleTaskLogTableSchemas,
    errorLogTableSchemas,
  }
}

export default useSchema

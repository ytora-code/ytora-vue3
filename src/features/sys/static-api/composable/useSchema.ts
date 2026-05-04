import DynamicFormSchema from '@/components/form/type/DynamicFormSchema'
import type DynamicTableSchema from '@/components/table/type/DynamicTableSchema'
import type SysStaticApiData from '../type/SysStaticApiData'
import type SysStaticApiParam from '../type/SysStaticApiParam'

/**
 * 产生表单和表格结构
 */
const useSchema = () => {
  const searchFormSchemas: DynamicFormSchema<SysStaticApiParam>[] = [
    {
      span: 6,
      label: '接口名称',
      type: 'input',
      dataKey: 'name',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 6,
      label: '请求路径',
      type: 'input',
      dataKey: 'uri',
      prop: {
        clearable: true,
        maxlength: 200,
      },
    },
    {
      span: 6,
      label: '请求类型',
      type: 'input',
      dataKey: 'type',
      prop: {
        clearable: true,
        maxlength: 50,
      },
    },
    {
      span: 6,
      label: '所属模块',
      type: 'input',
      dataKey: 'baseName',
      prop: {
        clearable: true,
        maxlength: 100,
      },
    },
    {
      span: 6,
      label: '控制器类',
      type: 'input',
      dataKey: 'controllerClassName',
      prop: {
        clearable: true,
        maxlength: 255,
      },
    },
  ]

  const tableSchemas: DynamicTableSchema<SysStaticApiData>[] = [
    {
      title: '接口名称',
      key: 'name',
      dataKey: 'name',
      width: 180,
    },
    {
      title: '所属模块',
      key: 'baseName',
      dataKey: 'baseName',
      width: 160,
    },
    {
      title: '请求类型',
      key: 'type',
      dataKey: 'type',
      width: 120,
    },
    {
      title: '基础路径',
      key: 'baseUri',
      dataKey: 'baseUri',
      width: 180,
    },
    {
      title: '最终路径',
      key: 'uri',
      dataKey: 'uri',
      width: 260,
    },
    {
      title: '控制器类',
      key: 'controllerClassName',
      dataKey: 'controllerClassName',
      width: 280,
    },
    {
      title: '处理器方法',
      key: 'handlerMethod',
      dataKey: 'handlerMethod',
      width: 260,
    },
    {
      title: 'Consumes',
      key: 'consumes',
      dataKey: 'consumes',
      width: 180,
    },
    {
      title: 'Produces',
      key: 'produces',
      dataKey: 'produces',
      width: 180,
    },
    {
      title: '备注',
      key: 'remark',
      dataKey: 'remark',
      width: 220,
    },
  ]

  return {
    searchFormSchemas,
    tableSchemas,
  }
}

export default useSchema

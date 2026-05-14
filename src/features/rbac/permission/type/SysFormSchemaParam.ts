import type BaseParam from '@/types/BaseParam'

/**
 * 表格列结构请求参数
 */
export default interface SysFormSchemaParam extends BaseParam {
  /**
   * table资源ID
   */
  permissionId?: string | number

  /**
   * 表单项类型
   */
  type?: string

  /**
   * 表单项标题宽度
   */
  label?: string

  /**
   * 表单项标题位置
   */
  labelPosition?: string

  /**
   * 表单项标题宽度
   */
  labelWidth?: number

  /**
   * 表单项尺寸
   */
  size?: string

  /**
   * 输入内容提示
   */
  placeholder?: string

  /**
   * 数据key
   */
  key?: string

  /**
   * 字典code
   */
  dictCode?: string

  /**
   * 是否隐藏
   */
  hidden?: boolean

  /**
   * 是否禁用
   */
  disabled?: boolean

  /**
   * 默认值
   */
  defaultValue?: string

  /**
   * 排序
   */
  index?: number

  /**
   * attr
   */
  attr?: string
}

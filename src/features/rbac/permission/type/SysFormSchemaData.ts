import type BaseData from '@/types/BaseData'

/**
 * 表格列结构响应数据
 */
export default interface SysFormSchemaData extends BaseData {
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
   * attr
   */
  attr?: string
}

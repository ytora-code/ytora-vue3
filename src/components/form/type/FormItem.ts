/**
 * created by YT on 2026/1/14 15:19
 */
export default interface FormItem {
  /**
   * 列id
   */
  id: string

  /**
   * code
   */
  permissionCode: string

  /**
   * 表单项类型
   */
  type: string

  /**
   * 表单项的label
   */
  label: string

  /**
   * 表单项的key
   */
  key: string

  /**
   * 宽度
   */
  width: number

  /**
   * 表单项属性
   */
  attr: Record<string, unknown>
}

export default interface TableColumn {
  /**
   * 列id
   */
  id: string

  /**
   * 列类型
   */
  colType: string

  /**
   * 列的key
   */
  key: string

  /**
   * 宽度
   */
  width: number

  /**
   * 列名称
   */
  name: string

  /**
   * 列编码
   */
  permissionCode: string

  /**
   * 列属性
   */
  attr: Record<string, unknown>

  /**
   * 子元素
   */
  children: TableColumn[]
}

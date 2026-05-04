export default interface BaseData {
  /**
   * 主键
   */
  id: string

  /**
   * 数据创建人
   */
  createBy?: string

  /**
   * 数据创建日期
   */
  createTime?: Date

  /**
   * 数据修改人
   */
  updateBy?: string

  /**
   * 数据修改日期
   */
  updateTime?: Date

  /**
   * 数据创建人所属部门
   */
  departCode?: string

  /**
   * 数据创建人所属部门
   */
  departCode_DICT?: string

  /**
   * 备注
   */
  remark?: string
}

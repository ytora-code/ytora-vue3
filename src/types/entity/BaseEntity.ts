/**
 * created by yangtong on 2025/5/22 21:49:53
 * <br/>
 * 实体类通用类型
 */
export default interface BaseEntity {
  /** 主键id */
  id: string

  /** 创建时间 */
  createTime?: string

  /** 创建人 */
  createBy?: string

  /** 更新时间 */
  updateTime?: string

  /** 更新人 */
  updateBy?: string

  /** 创建者所属部门 */
  departCode?: string

  /** 数据备注 */
  remark?: string | undefined

  /** 数据状态 */
  status?: number | undefined
}

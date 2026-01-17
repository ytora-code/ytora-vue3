import type BaseResp from '@/types/resp/BaseResp.ts'

/**
 * created by YT on 2026/1/17 上午2:58
 * 数据库对象的属性结构
 */
export default interface DbObjTree extends BaseResp {
  /**
   * id
   */
  id: string
  /**
   * 所属数据源
   */
  ds: string
  /**
   * 对象名称
   */
  name: string
  /**
   * 对象类型，schema，table，view，function，procedure，sequence等
   */
  type: string
  /**
   * 对象注释
   */
  comment?: string
  /**
   * 是否叶子节点
   */
  isLeaf?: boolean
  /**
   * 子对象
   */
  children?: DbObjTree[]
}

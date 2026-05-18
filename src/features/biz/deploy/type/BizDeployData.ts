import type BaseData from '@/types/BaseData'

/**
 * 开发者响应数据
 */
export default interface BizDeployData extends BaseData {

  /**
   * 姓名
   */
  name?: string

  /**
   * 身份证
   */
  idCard?: string

  /**
   * 专业方向
   */
  professional?: string

  /**
   * 状态，待初审，初审不通过，初审通过待复核，复核不通过，复核通过
   */
  status?: string

}

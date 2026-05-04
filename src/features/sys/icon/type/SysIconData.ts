import BaseData from '@/types/BaseData'

export default interface SysIconData extends BaseData {
  /**
   * 图标编码，比如'i-lucide-airplay'
   */
  code: string

  /**
   * 图标名称
   */
  name: string

  /**
   * 图标库类型，默认lucide
   */
  type: string
}

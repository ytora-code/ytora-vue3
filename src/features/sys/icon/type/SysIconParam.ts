import BaseParam from "@/types/BaseParam";

export default interface SysIconParam extends BaseParam {
  /**
   * 图标编码或者名称
   */
  key?: string

  /**
   * 图标库类型，默认lucide
   */
  type?: string

}

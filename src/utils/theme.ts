import { type GlobalThemeOverrides } from 'naive-ui'

/**
 * 纯 TS 颜色处理工具
 * 采用标准的 Tint/Shade (混白/混黑) 算法，与 Ant Design 等主流 UI 库逻辑一致
 */
class ColorFactory {
  private readonly r: number
  private readonly g: number
  private readonly b: number

  constructor(hex: string) {
    // 容错处理：处理 # 号
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
    // 容错处理：处理简写 (如 f00 -> ff0000)
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split('')
            .map((char) => char + char)
            .join('')
        : cleanHex

    // 解析 RGB
    const int = parseInt(fullHex, 16)
    this.r = (int >> 16) & 255
    this.g = (int >> 8) & 255
    this.b = int & 255
  }

  // 混入白色 (模拟 Hover)
  // ratio: 0.1 代表混入 10% 的白色
  mixWhite(ratio: number): string {
    const r = Math.round(this.r + (255 - this.r) * ratio)
    const g = Math.round(this.g + (255 - this.g) * ratio)
    const b = Math.round(this.b + (255 - this.b) * ratio)
    return this.toHex(r, g, b)
  }

  // 混入黑色 (模拟 Pressed)
  // ratio: 0.1 代表混入 10% 的黑色
  mixBlack(ratio: number): string {
    const r = Math.round(this.r * (1 - ratio))
    const g = Math.round(this.g * (1 - ratio))
    const b = Math.round(this.b * (1 - ratio))
    return this.toHex(r, g, b)
  }

  private toHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      // 限制范围 0-255 并转 16 进制
      const hex = Math.max(0, Math.min(255, n)).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
}

export const createTheme = (mainColor: string): GlobalThemeOverrides => {
  const c = new ColorFactory(mainColor)

  // 这里的比例经过微调，视觉效果最接近主流设计规范
  // Hover 稍微亮一点
  const hoverColor = c.mixWhite(0.12)
  // Pressed 稍微暗一点
  const pressedColor = c.mixBlack(0.12)
  // Suppl 辅助色通常和 Hover 保持一致即可
  return {
    common: {
      primaryColor: mainColor,
      primaryColorHover: hoverColor,
      primaryColorPressed: pressedColor,
      primaryColorSuppl: hoverColor,
    },
    // 强制加载条也跟随主色
    LoadingBar: {
      colorLoading: mainColor,
    },
  }
}

export const defaultTheme = createTheme('#1890ff')

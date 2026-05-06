import useIconStore from '@/stores/useIconStore'
import type SysIconData from '../type/SysIconData'

const normalizeIconCode = (icon: string) => {
  if (!icon) return ''

  const normalizedInput = icon.trim()
  if (!normalizedInput) return ''

  return normalizedInput
}

type ResolvedIconData = SysIconData & { body: string }
type LocalIconData = Required<Pick<ResolvedIconData, 'body' | 'width' | 'height'>>

const genericFallbackIcon: LocalIconData = {
  width: 24,
  height: 24,
  body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m4.2 1.8l2.9-2.9M18 12h4m-5.8 4.2l2.9 2.9M12 18v4m-7.1-2.9l2.9-2.9M2 12h4M4.9 4.9l2.9 2.9"/>',
}

const createSvgVNode = (iconData: ResolvedIconData) =>
  h('svg', {
    viewBox: `0 0 ${iconData.width ?? 24} ${iconData.height ?? 24}`,
    width: '1em',
    height: '1em',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
    innerHTML: iconData.body,
  })

const buildSvgString = (
  iconData: ResolvedIconData,
  options?: {
    size?: number
    color?: string
  },
) => {
  const size = options?.size ?? 64
  const color = options?.color ?? '#111111'

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${size}"
     height="${size}"
     viewBox="0 0 ${iconData.width ?? 24} ${iconData.height ?? 24}"
     fill="none"
     stroke="${color}"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round"
     color="${color}">
  ${iconData.body}
</svg>
`.trim()
}

/**
 * 通过icon名称渲染图标
 * @param icon
 */
export const renderIcon = (icon?: string) => {
  if (!icon) return undefined

  const iconCode = normalizeIconCode(icon)

  return () => {
    const iconStore = useIconStore()
    const iconData = iconStore.getCachedIcon(iconCode)

    if (iconData?.body) {
      return createSvgVNode(iconData as ResolvedIconData)
    }

    void iconStore.ensureIcon(iconCode)
    return createSvgVNode(genericFallbackIcon as ResolvedIconData)
  }
}

/**
 * 将 Lucide 图标转换成 SVG 字符串
 */
export const getIconSvg = (
  icon: string,
  options?: {
    size?: number
    color?: string
  },
) => {
  const iconCode = normalizeIconCode(icon)
  const iconStore = useIconStore()
  const iconData = iconStore.getCachedIcon(iconCode)

  if (!iconData?.body) {
    void iconStore.ensureIcon(iconCode)
    return buildSvgString(genericFallbackIcon as ResolvedIconData, options)
  }

  return buildSvgString(iconData as ResolvedIconData, options)
}

export const ensureIconSvg = async (
  icon: string,
  options?: {
    size?: number
    color?: string
  },
) => {
  const iconCode = normalizeIconCode(icon)
  const iconStore = useIconStore()
  const iconData = await iconStore.ensureIcon(iconCode)

  if (!iconData?.body) {
    return buildSvgString(genericFallbackIcon as ResolvedIconData, options)
  }

  return buildSvgString(iconData as ResolvedIconData, options)
}

export interface IconifyIconData {
  body: string
  width?: number
  height?: number
}

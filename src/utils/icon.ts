import lucideIconSet from '@iconify-json/lucide/icons.json'

const lucideIcons = lucideIconSet.icons as Record<string, IconifyIconData>
// console.log(lucideIcons)

const normalizeLucideIconName = (icon: string) => {
  if (!icon) return ''

  return icon
    .replace(/^i-lucide-/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

/**
 * 通过icon名称渲染图标
 * @param icon
 */
export const renderIcon = (icon?: string) => {
  if (!icon) return undefined

  const iconName = normalizeLucideIconName(icon)
  const iconData = lucideIcons[iconName]

  if (iconData) {
    return () =>
      h('svg', {
        viewBox: `0 0 ${iconData.width ?? 24} ${iconData.height ?? 24}`,
        width: '1em',
        height: '1em',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
        innerHTML: iconData.body,
      })
  }

  return () => h('span', { class: icon })
}

export interface IconifyIconData {
  body: string
  width?: number
  height?: number
}

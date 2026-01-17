import { type Component, defineAsyncComponent, h, type VNodeChild } from 'vue'
import { type IconProps, NIcon, NSkeleton } from 'naive-ui'

/**
 * 严格定义图标模块的导出结构
 */
type IconModule = Record<string, Component>

const BASE_PATH = '../../node_modules/@vicons/ionicons5/es/'

/**
 * 使用 Vite 的泛型 glob 语法
 */
const iconModules = import.meta.glob<IconModule>('../../node_modules/@vicons/ionicons5/es/*.js')

// 缓存 Map，类型约束为 Component
const iconCache = new Map<string, Component>()

export function renderAsyncIcon(
  iconName: string | undefined,
  iconProps: IconProps = {},
): (() => VNodeChild) | undefined {
  if (!iconName) return undefined

  // 1. 检查缓存
  const cached = iconCache.get(iconName)
  if (cached) {
    return () => h(NIcon, iconProps, { default: () => h(cached) })
  }

  // 2. 匹配加载器
  const path = `${BASE_PATH}${iconName}.js`
  const loader = iconModules[path]

  if (!loader) {
    console.warn(`[IconRenderer] 找不到图标模块: ${path}`)
    return undefined
  }

  // 3. 定义异步组件
  const AsyncIcon = defineAsyncComponent({
    loader: async () => {
      const mod = await loader()
      const iconComponent = mod[iconName] || mod.default || Object.values(mod)[0]

      if (!iconComponent) {
        throw new Error(`[IconRenderer] 模块 ${path} 中未找到导出项: ${iconName}`)
      }

      // 使用类型断言强制转换为 Component，确保不包含 undefined
      return iconComponent as Component
    },
    loadingComponent: () =>
      h(NSkeleton, {
        circle: true,
        width: '1em',
        height: '1em',
        style: { display: 'inline-block', verticalAlign: 'middle' },
      }),
    delay: 200,
    timeout: 10000,
  })

  // 4. 存入缓存
  iconCache.set(iconName, AsyncIcon)

  return () => h(NIcon, iconProps, { default: () => h(AsyncIcon) })
}

/**
 * 获取所有图标名称
 */
export function getAllIconNames(): string[] {
  return Object.keys(iconModules).map((path) => {
    return path.replace(BASE_PATH, '').replace('.js', '')
  })
}

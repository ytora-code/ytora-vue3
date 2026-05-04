import { darkTheme, type GlobalTheme } from 'naive-ui'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { appConfig } from '@/config/app'

export const useAppStore = defineStore('app', () => {
  const isDark = ref(false)
  const sidebarCollapsed = ref(false)
  const layout = ref({ ...appConfig.layout })

  const naiveTheme = computed<GlobalTheme | null>(() => (isDark.value ? darkTheme : null))
  const sidebarWidth = computed(() =>
    sidebarCollapsed.value ? layout.value.sidebarCollapsedWidth : layout.value.sidebarWidth,
  )
  const layoutCssVars = computed<Record<string, string>>(() => ({
    '--global-header-height': `${layout.value.headerHeight}px`,
    '--global-sidebar-width': `${layout.value.sidebarWidth}px`,
    '--global-sidebar-collapsed-width': `${layout.value.sidebarCollapsedWidth}px`,
    '--global-page-padding': `${layout.value.pagePadding}px`,
    '--global-border-radius': `${layout.value.borderRadius}px`,
    '--global-layout-transition-duration': `${layout.value.transitionDuration}ms`,
  }))
  const colorCssVars = computed<Record<string, string>>(() => ({
    '--global-color-primary': appConfig.colors.primary,
    '--global-color-primary-hover': appConfig.colors.primaryHover,
    '--global-color-primary-active': appConfig.colors.primaryActive,
    '--global-color-success': appConfig.colors.success,
    '--global-color-warning': appConfig.colors.warning,
    '--global-color-error': appConfig.colors.error,
    '--global-color-info': appConfig.colors.info,
  }))
  const themeCssVars = computed<Record<string, string>>(() => {
    const theme = isDark.value ? appConfig.theme.dark : appConfig.theme.light

    return {
      '--global-text-color': theme.textColor,
      '--global-text-color-secondary': theme.textColorSecondary,
      '--global-text-color-tertiary': theme.textColorTertiary,
      '--global-border-color': theme.borderColor,
      '--global-fill-color': theme.fillColor,
      '--global-bg-color': theme.bgColor,
      '--global-bg-container': theme.bgContainer,
      '--global-bg-elevated': theme.bgElevated,
      '--global-bg-header': theme.bgHeader,
      '--global-bg-sider': theme.bgSider,
      '--global-shadow-header': theme.shadowHeader,
      '--global-shadow-sider': theme.shadowSider,
      '--global-shadow-content': theme.shadowContent,
    }
  })
  const appCssVars = computed<Record<string, string>>(() => ({
    ...colorCssVars.value,
    ...layoutCssVars.value,
    ...themeCssVars.value,
  }))

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  return {
    isDark,
    appCssVars,
    layout,
    naiveTheme,
    sidebarCollapsed,
    sidebarWidth,
    setSidebarCollapsed,
    toggleSidebar,
    toggleTheme,
  }
})

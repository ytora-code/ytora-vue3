import { computed } from 'vue'
import { appConfig } from '@/config/app'
import { useAppStore } from '@/stores/app'

export const useMonitorChartTheme = () => {
  const appStore = useAppStore()

  return computed(() => {
    const theme = appStore.isDark ? appConfig.theme.dark : appConfig.theme.light

    return {
      axisLabelColor: theme.textColorTertiary,
      legendTextColor: theme.textColorSecondary,
      valueLabelColor: theme.textColor,
      splitLineColor: appStore.isDark ? 'rgba(132, 146, 166, 0.18)' : 'rgba(231, 237, 245, 0.9)',
      tooltipBackgroundColor: appStore.isDark
        ? 'rgba(29, 45, 68, 0.96)'
        : 'rgba(255, 255, 255, 0.96)',
      tooltipBorderColor: theme.borderColor,
      tooltipTextColor: theme.textColor,
    }
  })
}

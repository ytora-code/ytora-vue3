import type { GlobalThemeOverrides } from 'naive-ui'
import { appConfig } from '@/config/app'

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: appConfig.colors.primary,
    primaryColorHover: appConfig.colors.primaryHover,
    primaryColorPressed: appConfig.colors.primaryActive,
    primaryColorSuppl: appConfig.colors.primaryHover,
    successColor: appConfig.colors.success,
    warningColor: appConfig.colors.warning,
    errorColor: appConfig.colors.error,
    infoColor: appConfig.colors.info,
  },
  LoadingBar: {
    colorLoading: appConfig.colors.primary,
    colorError: appConfig.colors.error,
  },
}

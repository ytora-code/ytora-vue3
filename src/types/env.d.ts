/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_APP_HOST?: string
  readonly VITE_APP_PORT?: string
  readonly VITE_OPEN?: string
  readonly VITE_REQUEST_BASE_URL?: string
  readonly VITE_FILE_UPLOAD_PATH?: string
  readonly VITE_FILE_DOWNLOAD_PATH?: string
  readonly VITE_REQUEST_TIME_OUT?: string
  readonly VITE_TOKEN_TIME_OUT?: string
  readonly VITE_PUBLIC_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_ENV__: string
declare const __BUILD_TIME__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

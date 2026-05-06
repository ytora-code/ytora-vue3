import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  // 环境变量文件目录。当前项目把 .env.dev、.env.test、.env.prod 放在 config/ 下。
  const envDir = fileURLToPath(new URL('.', import.meta.url))

  // 在 vite.config.ts 中手动读取环境变量，用于配置 server、preview、build 等构建选项。
  // 第三个参数使用 VITE_，表示这里只读取会暴露给前端的 VITE_* 变量。
  const env = loadEnv(mode, envDir, 'VITE_')

  const appName = env.VITE_APP_NAME || 'ytora'
  const host = env.VITE_APP_HOST || '0.0.0.0'
  const port = Number(env.VITE_APP_PORT || 5173)
  const shouldOpen = env.VITE_OPEN === 'true'
  const publicPath = env.VITE_PUBLIC_PATH || '/'
  const isDevMode = mode === 'dev'
  const _isProdMode = mode === 'prod'

  return {
    // Vite 自动加载 config/.env、config/.env.[mode] 等环境变量文件。
    envDir,

    // 部署到非域名根路径时使用，例如 /admin/。默认使用环境变量里的 VITE_PUBLIC_PATH。
    base: publicPath,

    plugins: [
      vue(),

      // UnoCSS 原子化 CSS 插件，读取项目已有的 config/uno.config.ts。
      UnoCSS({ configFile: './config/uno.config.ts' }),

      // 自动导入 Vue Composition API 和 Naive UI 常用 hook。
      // 例如可以直接使用 ref、computed、useMessage，不需要在每个文件里手写 import。
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          {
            'naive-ui': ['useDialog', 'useLoadingBar', 'useMessage', 'useNotification'],
            '@/utils/naiveApi': ['message', 'notification', 'dialog', 'loadingBar'],
            '@tanstack/vue-query': [
              'useInfiniteQuery',
              'useIsFetching',
              'useIsMutating',
              'useMutation',
              'useQuery',
              'useQueryClient',
            ],
          },
        ],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: 'config/.eslintrc-auto-import.json',
          globalsPropValue: 'readonly',
        },
      }),

      // 自动导入 Vue 组件，配合 NaiveUiResolver 后可以直接在模板里使用 n-button、n-card 等组件。
      Components({
        dts: 'src/types/components.d.ts',
        resolvers: [NaiveUiResolver()],
      }),

      // Vue DevTools 只在本地开发模式启用，避免影响测试/生产构建。
      isDevMode ? vueDevTools() : null,

      // 打包体积分析，每次build都会产生。构建后会生成 stats.html 并自动打开。
      !isDevMode
        ? visualizer({
            filename: `${appName}/stats.html`,
            open: true,
            gzipSize: true,
            brotliSize: true,
          })
        : null,
    ].filter(Boolean),

    resolve: {
      alias: {
        // @ 指向 src 目录，业务代码里可以使用 @/xxx 代替相对路径。
        '@': fileURLToPath(new URL('../src', import.meta.url)),
      },
    },

    server: {
      // 本地开发服务器配置，来自 config/.env.dev。
      host,
      port,
      open: shouldOpen,
      // proxy: {
      //   '/ytora': {
      //     target: 'http://127.0.0.1:9876',
      //     changeOrigin: true,
      //     secure: false,
      //   },
      // },
    },

    preview: {
      // 预览生产构建产物的本地服务配置。
      host,
      port,
      open: shouldOpen,
    },

    build: {
      // 打包后的输出目录。
      outDir: `${appName}`,

      // 每次构建前清空旧的输出目录，避免历史文件残留。
      emptyOutDir: true,

      // Vite 默认会额外计算 gzip 后大小；这里关闭，减少构建耗时。
      reportCompressedSize: false,

      // 只在 dev mode 构建时生成 sourcemap，便于排查开发环境构建问题。
      sourcemap: isDevMode,

      rollupOptions: {
        output: {
          // 手动拆包：框架和通用依赖单独成包，便于浏览器缓存。
          // 使用函数式拆包可以避免某个依赖暂时没有被入口使用时生成空 chunk。
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/pinia/')) {
                return 'vue'
              }

              if (id.includes('/axios/')) {
                return 'vendor'
              }
            }

            return undefined
          },
        },
      },
    },

    define: {
      // 编译期全局常量，代码里可以直接读取 __APP_ENV__ 和 __BUILD_TIME__。
      __APP_ENV__: JSON.stringify(mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})

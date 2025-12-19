import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname)
  //加载环境文件(.env)
  const env = loadEnv(mode, envDir, '')
  return {
    plugins: [
      visualizer({
        open: true, // 构建完成后自动打开报告
        gzipSize: true, // 显示压缩后的文件大小
        brotliSize: true, // 显示 Brotli 压缩后的文件大小
      }),
      vue(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
        ],
      }),
      Components({ resolvers: [NaiveUiResolver()] }),
      //开发时才启用vueDevTools插件
      mode === 'dev' ? vueDevTools() : null,
    ].filter(Boolean),
    envDir,
    server: {
      host: env.VITE_APP_HOST,
      port: Number(env.VITE_APP_PORT),
      open: true,
    },
    preview: {
      host: env.VITE_APP_HOST,
      port: Number(env.VITE_APP_PORT),
      open: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      //打包后产生文件夹的名称
      outDir: env.VITE_APP_NAME,
      //每次构建清空旧目录
      emptyOutDir: true,
      //打包时不输出gzip大小
      reportCompressedSize: false,
      //只在开发环境打sourcemap
      sourcemap: mode === 'dev',
      //拆包
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            vendor: ['axios'],
          },
        },
      },
    },
    //一些全局宏
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __BUILD_TIME__: JSON.stringify(new Date()),
    },
  }
})

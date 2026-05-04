import '@/assets/styles/reset.css'
import 'uno.css'
import '@/assets/styles/global.css'

import { createApp } from 'vue'

import App from './App.vue'
import { setupApp } from './setup'

async function bootstrap() {
  const app = createApp(App)

  await setupApp(app)

  app.mount('#app')

  console.log('正在使用vue版本:', app.version)
  console.log('构建时间：', __BUILD_TIME__)
  console.log('当前环境：', __APP_ENV__)
}

void bootstrap()

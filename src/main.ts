import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log("正在使用vue版本:", app.version)
console.log('构建时间：', __BUILD_TIME__)
console.log('当前环境：', __APP_ENV__)

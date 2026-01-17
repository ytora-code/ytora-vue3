import 'virtual:uno.css'
import '@/assets/reset.css'
import 'vxe-table/lib/style.css'
import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VXETable from 'vxe-table'

// 创建 App
const app = createApp(App)
// 注册路由
app.use(router)
// 注册 PINIA
app.use(createPinia())
// 注册 VTABLE 核心组件
app.use(VXETable)

app.mount('#app')

console.log('正在使用vue版本:', app.version)
console.log('构建时间：', __BUILD_TIME__)
console.log('当前环境：', __APP_ENV__)

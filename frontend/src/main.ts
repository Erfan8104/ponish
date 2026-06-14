import { createApp } from 'vue'

import { createPinia } from 'pinia'

import './assets/main.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'
import App from './App.vue'

import router from './router'

const app = createApp(App)
app.use(Toast, {
  position: 'top-right', // یا top-left برای پروژه‌های فارسی
  timeout: 3000,
  rtl: true, // پشتیبانی از راست‌چین
})

app.use(createPinia())

app.use(router)

app.mount('#app')

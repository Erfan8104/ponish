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

// 🌟 ۱. ایمپورت کردن تابع ثبت PWA
import { registerSW } from 'virtual:pwa-register'

// 🌟 ۲. راه‌اندازی و بررسی آپدیت‌ها
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('نسخه جدیدی از اپلیکیشن موجود است. آیا مایل به بروزرسانی هستید؟')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('اپلیکیشن آماده کار به صورت آفلاین است.')
  },
})

const app = createApp(App)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  rtl: true,
})

app.use(createPinia())

app.use(router)

app.mount('#app')

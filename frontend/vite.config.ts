import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // 🌟 ۱. اضافه کردن این خط

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    // 🌟 ۲. اضافه کردن تنظیمات PWA در کنار بقیه پلاگین‌ها
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'images/default-avatar.png'],
      manifest: {
        name: 'Ponisha Clone',
        short_name: 'Ponisha',
        description: 'پلتفرم پروژه‌های مهندسی و نقشه‌برداری',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/images/default-avatar.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/default-avatar.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

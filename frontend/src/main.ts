import { createApp } from 'vue'

import { createPinia } from 'pinia'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'
import './assets/main.css'

import App from './App.vue'

import router from './router'

const app = createApp(App)

app.use(createPinia())

app.use(router)

app.mount('#app')

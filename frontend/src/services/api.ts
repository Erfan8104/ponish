import axios from 'axios'

// تعیین خودکار آدرس سرور بر اساس آدرسی که کاربر در مرورگر زده است
const getBaseUrl = () => {
  // اگر روی لوکال خودتان کار می‌کنید
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api'
  }
  // اگر روی سرور (یا هر IP دیگری) باز شده باشد، از همان IP با پورت 5000 استفاده می‌کند
  return `http://${window.location.hostname}:5000/api`
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

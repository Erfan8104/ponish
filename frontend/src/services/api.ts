import axios from 'axios'

const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api'
  }
  return `http://${window.location.hostname}:5000/api`
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// ارسال توکن در درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// مدیریت پاسخ‌ها و خطاهای سرور (Response Interceptor)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // ۱. پاک کردن توکن منقضی شده
      localStorage.removeItem('token')

      // ۲. بررسی اینکه آیا کاربر در بخش ادمین است یا پنل عادی
      const isAdminRoute = window.location.pathname.startsWith('/admin')

      // ۳. هدایت به صفحه ورود متناسب با مسیر فعلی
      if (isAdminRoute) {
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login'
        }
      } else {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

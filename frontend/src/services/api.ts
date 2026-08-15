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

// جلوگیری از چندین بار ریدایرکت
let isRedirecting = false

// Request Interceptor
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

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true

      // پاک کردن همه اطلاعات احراز هویت
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('refreshToken')

      const currentPath = window.location.pathname
      const isAdminRoute = currentPath.startsWith('/admin')

      // فقط وقتی در صفحه لاگین نیستیم ریدایرکت کن
      if (isAdminRoute && !currentPath.includes('/admin/login')) {
        window.location.href = '/admin/login'
      } else if (!isAdminRoute && !currentPath.includes('/login')) {
        window.location.href = '/login'
      } else {
        // اگر همین الان در صفحه لاگین هستیم، فلگ رو ریست کن
        isRedirecting = false
      }
    }

    return Promise.reject(error)
  },
)

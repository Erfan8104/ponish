import { api } from './api'

// درخواست لاگین ادمین
export const adminLoginApi = async (phone: string, password: string) => {
  const response = await api.post('/admin/login', { phone, password })
  return response.data
}

// 🌟 دریافت لیست کاربران برای پنل مدیریت
export const getAllUsersApi = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

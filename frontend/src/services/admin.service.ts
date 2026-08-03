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

// 🌟 تغییر وضعیت (فعال/غیرفعال) کاربر توسط ادمین
export const toggleUserStatusApi = async (userId: number) => {
  const response = await api.patch(`/admin/users/${userId}/toggle-status`)
  return response.data
}

import { defineStore } from 'pinia'
import { adminLoginApi, getAllUsersApi, toggleUserStatusApi } from '@/services/admin.service'
import { api } from '@/services/api' // فرض بر این است که نمونه آکسیوس شما اینجا قرار دارد

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('adminToken') || '',
    name: localStorage.getItem('adminName') || '',
    phone: localStorage.getItem('adminPhone') || '',
    users: [] as any[], // 🌟 نگهداری لیست کاربران
    loading: false,
    errorMessage: null as string | null,
  }),

  actions: {
    // تنظیم توکن ادمین روی هدر آکسیوس برای درخواست‌های بعدی
    setAuthHeader() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } else {
        delete api.defaults.headers.common['Authorization']
      }
    },

    async login(phone: string, pass: string) {
      this.loading = true
      this.errorMessage = null

      try {
        const data = await adminLoginApi(phone, pass)

        if (data.success) {
          this.token = data.token
          this.name = data.user.name
          this.phone = data.user.phone

          // ذخیره در localStorage با کلیدهای اختصاصی ادمین
          localStorage.setItem('adminToken', data.token)
          localStorage.setItem('adminName', data.user.name)
          localStorage.setItem('adminPhone', data.user.phone)

          // اعمال توکن در هدر
          this.setAuthHeader()

          return true
        }
      } catch (error: any) {
        this.errorMessage =
          error.response?.data?.message || 'خطا در ورود به پنل مدیریت. لطفاً اطلاعات را بررسی کنید.'
        return false
      } finally {
        this.loading = false
      }
    },

    // 🌟 گرفتن لیست کاربران
    async fetchUsers() {
      this.loading = true
      try {
        this.setAuthHeader()
        const data = await getAllUsersApi()
        if (data.success) {
          this.users = data.users
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    // 🌟 تغییر وضعیت کاربر
    async toggleUserStatus(userId: number) {
      try {
        this.setAuthHeader()
        const data = await toggleUserStatusApi(userId)
        if (data.success) {
          // آپدیت کردن لیست محلی در استور بدون نیاز به ریکوئست مجدد
          const userIndex = this.users.findIndex((u) => u.id === userId)
          if (userIndex !== -1) {
            this.users[userIndex].isActive = data.user.isActive
          }
          return true
        }
      } catch (error) {
        console.error('Error toggling user status:', error)
        return false
      }
    },

    logout() {
      this.token = ''
      this.name = ''
      this.phone = ''

      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      localStorage.removeItem('adminPhone')

      delete api.defaults.headers.common['Authorization']
    },
  },
})

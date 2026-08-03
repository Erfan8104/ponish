import { defineStore } from 'pinia'
import { adminLoginApi } from '@/services/admin.service'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('adminToken') || '',
    name: localStorage.getItem('adminName') || '',
    phone: localStorage.getItem('adminPhone') || '',
    loading: false,
    errorMessage: null as string | null,
  }),

  actions: {
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

    logout() {
      this.token = ''
      this.name = ''
      this.phone = ''

      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      localStorage.removeItem('adminPhone')
    },
  },
})

import { defineStore } from 'pinia'
import { adminLoginApi, getAllUsersApi, toggleUserStatusApi } from '@/services/admin.service'
import { api } from '@/services/api'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('adminToken') || '',
    name: localStorage.getItem('adminName') || '',
    phone: localStorage.getItem('adminPhone') || '',
    adminRoles: JSON.parse(localStorage.getItem('adminRoles') || '[]') as {
      name: string
      displayName: string
    }[],
    permissions: JSON.parse(localStorage.getItem('adminPermissions') || '[]') as string[],
    users: [] as any[],
    loading: false,
    errorMessage: null as string | null,
  }),

  getters: {
    // آیا کاربر لاگین کرده؟
    isAuthenticated: (state) => !!state.token,

    // آیا Super Admin است؟
    isSuperAdmin: (state) =>
      state.permissions.includes('*') || state.adminRoles.some((r) => r.name === 'SUPER_ADMIN'),

    // چک کردن یک دسترسی خاص
    hasPermission: (state) => {
      return (permissionKey: string) => {
        if (state.permissions.includes('*')) return true
        return state.permissions.includes(permissionKey)
      }
    },
  },

  actions: {
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
          this.name = data.user.name || ''
          this.phone = data.user.phone
          this.adminRoles = data.user.adminRoles || []
          this.permissions = data.user.permissions || []

          // ذخیره در localStorage
          localStorage.setItem('adminToken', data.token)
          localStorage.setItem('adminName', data.user.name || '')
          localStorage.setItem('adminPhone', data.user.phone)
          localStorage.setItem('adminRoles', JSON.stringify(this.adminRoles))
          localStorage.setItem('adminPermissions', JSON.stringify(this.permissions))

          this.setAuthHeader()
          return true
        }

        this.errorMessage = data.message || 'ورود ناموفق بود'
        return false
      } catch (error: any) {
        this.errorMessage =
          error.response?.data?.message || 'خطا در ورود به پنل مدیریت. لطفاً اطلاعات را بررسی کنید.'
        return false
      } finally {
        this.loading = false
      }
    },

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

    async toggleUserStatus(userId: number) {
      try {
        this.setAuthHeader()
        const data = await toggleUserStatusApi(userId)
        if (data.success) {
          const userIndex = this.users.findIndex((u) => u.id === userId)
          if (userIndex !== -1) {
            this.users[userIndex].isActive = data.user.isActive
          }
          return true
        }
        return false
      } catch (error) {
        console.error('Error toggling user status:', error)
        return false
      }
    },

    logout() {
      this.token = ''
      this.name = ''
      this.phone = ''
      this.adminRoles = []
      this.permissions = []
      this.users = []

      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      localStorage.removeItem('adminPhone')
      localStorage.removeItem('adminRoles')
      localStorage.removeItem('adminPermissions')

      delete api.defaults.headers.common['Authorization']
    },
  },
})

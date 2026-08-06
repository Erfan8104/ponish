import { defineStore } from 'pinia'
import {
  adminLoginApi,
  getAllUsersApi,
  toggleUserStatusApi,
  getDashboardStatsApi,
} from '@/services/admin.service'
import { api } from '@/services/api'

export interface DashboardStats {
  usersCount: number
  projectsCount: number
  activeProjects: number
  activeContracts: number
  todayPayments: number
  newUsersToday: number
  revenue: number
  pendingReviews: number
  pendingReports: number
}

export interface ChartPoint {
  date: string
  label: string
  value: number
}

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

    // ---- داشبورد ----
    dashboardLoading: false,
    stats: null as DashboardStats | null,
    latestUsers: [] as any[],
    latestProjects: [] as any[],
    charts: {
      dailyRegistrations: [] as ChartPoint[],
      dailyProjects: [] as ChartPoint[],
      dailyPayments: [] as ChartPoint[],
    },
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    isSuperAdmin: (state) =>
      state.permissions.includes('*') || state.adminRoles.some((r) => r.name === 'SUPER_ADMIN'),

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

    // 🌟 دریافت آمار داشبورد
    async fetchDashboardStats() {
      this.dashboardLoading = true
      try {
        this.setAuthHeader()
        const data = await getDashboardStatsApi()
        if (data.success) {
          this.stats = data.stats
          this.latestUsers = data.latestUsers || []
          this.latestProjects = data.latestProjects || []
          this.charts = {
            dailyRegistrations: data.charts?.dailyRegistrations || [],
            dailyProjects: data.charts?.dailyProjects || [],
            dailyPayments: data.charts?.dailyPayments || [],
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        this.dashboardLoading = false
      }
    },

    logout() {
      this.token = ''
      this.name = ''
      this.phone = ''
      this.adminRoles = []
      this.permissions = []
      this.users = []
      this.stats = null
      this.latestUsers = []
      this.latestProjects = []
      this.charts = {
        dailyRegistrations: [],
        dailyProjects: [],
        dailyPayments: [],
      }

      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminName')
      localStorage.removeItem('adminPhone')
      localStorage.removeItem('adminRoles')
      localStorage.removeItem('adminPermissions')

      delete api.defaults.headers.common['Authorization']
    },
  },
})

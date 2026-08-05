import { defineStore } from 'pinia'
import { ref } from 'vue'

type UserRole = 'freelancer' | 'employer' | 'both' | 'admin'

const VALID_ROLES: readonly UserRole[] = ['freelancer', 'employer', 'both', 'admin']

// اعتبارسنجی مقدار خوانده‌شده از localStorage تا مقادیر دستکاری‌شده یا نامعتبر وارد استیت نشن
const getStoredRole = (): UserRole | null => {
  const stored = localStorage.getItem('user_role')
  return VALID_ROLES.includes(stored as UserRole) ? (stored as UserRole) : null
}

export const useRoleStore = defineStore('user', () => {
  // خواندن مقادیر از LocalStorage در زمان لود اولیه سایت
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<UserRole | null>(getStoredRole())

  const setUserRegistration = (userUsername: string, userRole: UserRole) => {
    username.value = userUsername
    role.value = userRole

    localStorage.setItem('user_role', userRole)
    localStorage.setItem('username', userUsername)
  }

  // 🌟 اضافه شدن متد تنظیم یا تغییر نقش
  const setRole = (newRole: 'freelancer' | 'employer' | 'both') => {
    role.value = newRole
    localStorage.setItem('user_role', newRole)
  }

  // برای مواقعی که کاربر لوگ‌آوت می‌کند تا دیتا پاک شود
  const clearUser = () => {
    username.value = ''
    role.value = null
    localStorage.removeItem('user_role')
    localStorage.removeItem('username')
  }

  return {
    username,
    role,
    setUserRegistration,
    setRole, // 🌟 اکسپورت کردن متد جدید
    clearUser,
  }
})

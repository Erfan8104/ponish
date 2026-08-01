import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoleStore = defineStore('user', () => {
  // خواندن مقادیر از LocalStorage در زمان لود اولیه سایت
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<'freelancer' | 'employer' | 'both' | null>(
    localStorage.getItem('user_role') as 'freelancer' | 'employer' | 'both' | null,
  )

  const setUserRegistration = (
    userUsername: string,
    userRole: 'freelancer' | 'employer' | 'both',
  ) => {
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

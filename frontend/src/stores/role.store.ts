import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoleStore = defineStore('user', () => {
  //  خواندن مقادیر از LocalStorage در زمان لود اولیه سایت
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<'freelancer' | 'employer' | null>(
    localStorage.getItem('user_role') as 'freelancer' | 'employer' | null,
  )

  const setUserRegistration = (userUsername: string, userRole: 'freelancer' | 'employer') => {
    username.value = userUsername
    role.value = userRole

    localStorage.setItem('user_role', userRole)
    localStorage.setItem('username', userUsername)
  }

  // برای مواقعی که کاربر لوپ‌اوت می‌کند تا دیتا پاک شود
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
    clearUser,
  }
})

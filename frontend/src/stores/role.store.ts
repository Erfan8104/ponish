import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoleStore = defineStore('user', () => {
  // وضعیت‌ها (States)
  const username = ref<string>('')
  const role = ref<'freelancer' | 'employer' | null>(null)

  // اکشن برای ذخیره اطلاعات (Action)
  const setUserRegistration = (userUsername: string, userRole: 'freelancer' | 'employer') => {
    username.value = userUsername
    role.value = userRole

    // نکته اختیاری: اگر می‌خواهی با رفرش شدن صفحه اطلاعات نپره، می‌تونی اینجا داخل LocalStorage هم ذخیره‌اش کنی:
    localStorage.setItem('user_role', userRole)
    localStorage.setItem('username', userUsername)
  }

  return {
    username,
    role,
    setUserRegistration,
  }
})

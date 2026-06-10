import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    phone: localStorage.getItem('phone') || '',
    name: localStorage.getItem('name') || '',
  }),

  actions: {
    setToken(token: string, phone?: string, name?: string) {
      this.token = token
      localStorage.setItem('token', token)

      if (phone) {
        this.phone = phone
        localStorage.setItem('phone', phone)
      }

      if (name) {
        this.name = name
        localStorage.setItem('name', name)
      }
    },

    setPhone(phone: string) {
      this.phone = phone
      localStorage.setItem('phone', phone)
    },

    setName(name: string) {
      this.name = name
      localStorage.setItem('name', name)
    },

    logout() {
      this.token = ''
      this.phone = ''
      this.name = ''

      localStorage.removeItem('token')
      localStorage.removeItem('phone')
      localStorage.removeItem('name')
    },
  },
})

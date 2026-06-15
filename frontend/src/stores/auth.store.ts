import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    phone: localStorage.getItem('phone') || '',
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    profileCompleted: localStorage.getItem('profileCompleted') === 'true',
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

    setEmail(email: string) {
      this.email = email
      localStorage.setItem('email', email)
    },

    updateProfile(profile: { name: string; phone: string; email: string }) {
      this.name = profile.name
      this.phone = profile.phone
      this.email = profile.email
      this.profileCompleted = Boolean(profile.name.trim())

      localStorage.setItem('name', profile.name)
      localStorage.setItem('phone', profile.phone)
      localStorage.setItem('email', profile.email)
      localStorage.setItem('profileCompleted', String(this.profileCompleted))
    },

    logout() {
      this.token = ''
      this.phone = ''
      this.name = ''
      this.email = ''
      this.profileCompleted = false

      localStorage.removeItem('token')
      localStorage.removeItem('phone')
      localStorage.removeItem('name')
      localStorage.removeItem('email')
      localStorage.removeItem('profileCompleted')
    },
  },
})

import { defineStore } from 'pinia'

// تعریف یک اینترفیس برای ورودی متد آپدیت مشخصات جهت خوانایی بیشتر کدهای تایپ‌اسکریپت
interface ProfileUpdateInput {
  name: string
  phone: string
  email: string
  province: string
  city: string
  company: string
  // فیلدهای فریلنسر (جدید)
  birthDate: string
  birthPlace: string
  freelancerProvince: string
  freelancerCity: string
  education: string
  skills: string
  experience: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    phone: localStorage.getItem('phone') || '',
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
    profileCompleted: localStorage.getItem('profileCompleted') === 'true',

    // فیلدهای کارفرما
    province: localStorage.getItem('province') || '',
    city: localStorage.getItem('city') || '',
    company: localStorage.getItem('company') || '',

    // 🌟 فیلدهای فریلنسر (جدید)
    birthDate: localStorage.getItem('birthDate') || '',
    birthPlace: localStorage.getItem('birthPlace') || '',
    freelancerProvince: localStorage.getItem('freelancerProvince') || '',
    freelancerCity: localStorage.getItem('freelancerCity') || '',
    education: localStorage.getItem('education') || '',
    skills: localStorage.getItem('skills') || '',
    experience: localStorage.getItem('experience') || '',
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

    setProvince(province: string) {
      this.province = province
      localStorage.setItem('province', province)
    },

    setCity(city: string) {
      this.city = city
      localStorage.setItem('city', city)
    },

    setCompany(company: string) {
      this.company = company
      localStorage.setItem('company', company)
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

    // 🌟 بروزرسانی متد اصلی برای ذخیره همزمان تمام داده‌ها
    updateProfile(profile: ProfileUpdateInput) {
      // ۱. ذخیره اطلاعات مشترک و کارفرما در استور
      this.name = profile.name
      this.phone = profile.phone
      this.email = profile.email
      this.province = profile.province
      this.city = profile.city
      this.company = profile.company

      // ۲. ذخیره اطلاعات فریلنسر در استور (جدید)
      this.birthDate = profile.birthDate
      this.birthPlace = profile.birthPlace
      this.freelancerProvince = profile.freelancerProvince
      this.freelancerCity = profile.freelancerCity
      this.education = profile.education
      this.skills = profile.skills
      this.experience = profile.experience

      this.profileCompleted = Boolean(profile.name.trim())

      // ۳. ماندگاری اطلاعات مشترک و کارفرما در مرورگر
      localStorage.setItem('name', profile.name)
      localStorage.setItem('phone', profile.phone)
      localStorage.setItem('email', profile.email)
      localStorage.setItem('province', profile.province)
      localStorage.setItem('city', profile.city)
      localStorage.setItem('company', profile.company)
      localStorage.setItem('profileCompleted', String(this.profileCompleted))

      // ۴. ماندگاری اطلاعات فریلنسر در مرورگر (جدید)
      localStorage.setItem('birthDate', profile.birthDate)
      localStorage.setItem('birthPlace', profile.birthPlace)
      localStorage.setItem('freelancerProvince', profile.freelancerProvince)
      localStorage.setItem('freelancerCity', profile.freelancerCity)
      localStorage.setItem('education', profile.education)
      localStorage.setItem('skills', profile.skills)
      localStorage.setItem('experience', profile.experience)
    },

    // 🌟 متد خروج جهت پاک‌سازی تمام فیلدها از استور و دیسک مرورگر
    logout() {
      this.token = ''
      this.phone = ''
      this.name = ''
      this.email = ''
      this.profileCompleted = false
      this.province = ''
      this.city = ''
      this.company = ''

      // پاک‌سازی فیلدهای جدید در استور
      this.birthDate = ''
      this.birthPlace = ''
      this.freelancerProvince = ''
      this.freelancerCity = ''
      this.education = ''
      this.skills = ''
      this.experience = ''

      localStorage.removeItem('token')
      localStorage.removeItem('phone')
      localStorage.removeItem('name')
      localStorage.removeItem('email')
      localStorage.removeItem('profileCompleted')
      localStorage.removeItem('province')
      localStorage.removeItem('city')
      localStorage.removeItem('company')

      // پاک‌سازی فیلدهای جدید در مرورگر
      localStorage.removeItem('birthDate')
      localStorage.removeItem('birthPlace')
      localStorage.removeItem('freelancerProvince')
      localStorage.removeItem('freelancerCity')
      localStorage.removeItem('education')
      localStorage.removeItem('skills')
      localStorage.removeItem('experience')
    },
  },
})

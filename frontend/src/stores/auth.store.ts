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
  avatar: string
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
    avatar: localStorage.getItem('avatar') || '',
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

    setAvatar(avatarUrl: string) {
      this.avatar = avatarUrl
      localStorage.setItem('avatar', avatarUrl)
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

    // در فایل auth.store.ts

    // ۱. اضافه کردن فیلد avatar به متد اکشن (چون در بدنه متد فعلی‌ات فراموش شده بود)
    updateProfile(profile: ProfileUpdateInput, role: 'employer' | 'freelancer') {
      // اطلاعات مشترک
      this.name = profile.name
      this.phone = profile.phone
      this.email = profile.email
      this.avatar = profile.avatar // 🌟 اضافه شد
      this.profileCompleted = Boolean(profile.name.trim())

      localStorage.setItem('name', profile.name)
      localStorage.setItem('phone', profile.phone)
      localStorage.setItem('email', profile.email)
      localStorage.setItem('avatar', profile.avatar) // 🌟 اضافه شد
      localStorage.setItem('profileCompleted', String(this.profileCompleted))

      // تفکیک ذخیره‌سازی بر اساس نقش
      if (role === 'employer') {
        // ذخیره کارفرما
        this.province = profile.province
        this.city = profile.city
        this.company = profile.company
        localStorage.setItem('province', profile.province)
        localStorage.setItem('city', profile.city)
        localStorage.setItem('company', profile.company)

        // 🧼 پاکسازی دیتای فریلنسر از استور و لوکال استوری
        this.birthDate = ''
        this.birthPlace = ''
        this.freelancerProvince = ''
        this.freelancerCity = ''
        this.education = ''
        this.skills = ''
        this.experience = ''
        const keys = [
          'birthDate',
          'birthPlace',
          'freelancerProvince',
          'freelancerCity',
          'education',
          'skills',
          'experience',
        ]
        keys.forEach((key) => localStorage.removeItem(key))
      } else {
        // ذخیره فریلنسر
        this.birthDate = profile.birthDate
        this.birthPlace = profile.birthPlace
        this.freelancerProvince = profile.freelancerProvince
        this.freelancerCity = profile.freelancerCity
        this.education = profile.education
        this.skills = profile.skills
        this.experience = profile.experience

        localStorage.setItem('birthDate', profile.birthDate)
        localStorage.setItem('birthPlace', profile.birthPlace)
        localStorage.setItem('freelancerProvince', profile.freelancerProvince)
        localStorage.setItem('freelancerCity', profile.freelancerCity)
        localStorage.setItem('education', profile.education)
        localStorage.setItem('skills', profile.skills)
        localStorage.setItem('experience', profile.experience)

        // 🧼 پاکسازی دیتای کارفرما از استور و لوکال استوری
        this.province = ''
        this.city = ''
        this.company = ''
        localStorage.removeItem('province')
        localStorage.removeItem('city')
        localStorage.removeItem('company')
      }
    },
    logout() {
      this.avatar = ''
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

      localStorage.removeItem('avatar')
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

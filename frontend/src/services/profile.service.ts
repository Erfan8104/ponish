// src/services/profile.service.ts

import { api } from './api'

export interface UpdateProfilePayload {
  name: string
  phone: string
  email: string
  role: 'employer' | 'freelancer'

  province: string
  city: string

  company: string

  birthDate: string
  birthPlace: string
  freelancerProvince: string
  freelancerCity: string

  education: string
  skills: string
  experience: string

  avatar: string
}

export const ProfileService = {
  async updateProfile(data: UpdateProfilePayload) {
    const baseData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      avatar: data.avatar,
    }

    if (data.role === 'employer') {
      const employerPayload = {
        ...baseData,

        province: data.province,
        city: data.city,

        // کنترلر بک‌اند این نام‌ها را انتظار دارد
        companyName: data.company,
        companyType: '',
        website: '',
        address: '',
      }

      const { data: response } = await api.put('/profile/employer', employerPayload)

      return response
    }

    const freelancerPayload = {
      ...baseData,

      // کنترلر این دو مقدار را در جدول User ذخیره می‌کند
      province: data.freelancerProvince,
      city: data.freelancerCity,

      // دقیقا مطابق کنترلر
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,

      education: data.education,
      experience: data.experience,

      // کنترلر انتظار این دو فیلد را دارد
      hourlyRate: null,
      portfolioUrl: '',

      /**
       * کنترلر انتظار skillIds دارد.
       * فعلاً چون هنوز سیستم مهارت‌ها را نساخته‌ایم
       * آرایه خالی ارسال می‌کنیم.
       */
      skillIds: [],

      /**
       * فعلاً مقدار متنی skills
       * در بک‌اند استفاده نمی‌شود.
       */
      skills: data.skills,
    }

    const { data: response } = await api.put('/profile/freelancer', freelancerPayload)

    return response
  },
}

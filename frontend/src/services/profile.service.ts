import { api } from './api'

// ۱. تعریف یک اینترفیس برای ورودی متد (دقیقاً مشابه چیزی که در استور داری)
interface UpdateProfilePayload {
  name: string
  phone: string
  email: string
  role: 'employer' | 'freelancer' // نقشی که از roleStore می‌آید
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
    // ۲. فیلدهای عمومی و مشترک که در هر دو حالت ارسال می‌شوند
    const baseData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      avatar: data.avatar, // عکس پروفایل مشترک
    }

    // ۳. تفکیک دیتای ارسالی بر اساس نقش کاربر
    if (data.role === 'employer') {
      // ساخت لود مخصوص کارفرما
      const employerPayload = {
        ...baseData,
        province: data.province,
        city: data.city,
        company: data.company,
      }

      // ارسال به آبجکت یا اندپوینت مربوط به کارفرما
      const response = await api.put('/api/profile/employer', employerPayload)
      return response.data
    } else {
      // ساخت لود مخصوص فریلنسر/کارجو
      const freelancerPayload = {
        ...baseData,
        birth_date: data.birthDate,
        birth_place: data.birthPlace,
        province: data.freelancerProvince, // تبدیل به کلید استاندارد مورد نیاز دیتابیس
        city: data.freelancerCity,
        education: data.education,
        skills: data.skills,
        experience: data.experience,
      }

      // ارسال به آبجکت یا اندپوینت مربوط به فریلنسر
      const response = await api.put('/api/profile/freelancer', freelancerPayload)
      return response.data
    }
  },
}

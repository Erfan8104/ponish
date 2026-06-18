export type UserRole = 'freelancer' | 'employer'

export interface UserRegistrationPayload {
  username: string
  role: UserRole
}

export interface RegistrationState {
  username: string
  role: UserRole | null
  isValidUsername: boolean
}

export interface UpdateProfilePayload {
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

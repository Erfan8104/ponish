// src/services/auth.service.ts

import { api } from './api'

export const sendOtp = async (phone: string) => {
  const response = await api.post('/auth/send-otp', {
    phone,
  })

  return response.data
}

export const verifyOtp = async (phone: string, code: string) => {
  const response = await api.post('/auth/verify-otp', {
    phone,
    code,
  })

  return response.data
}

export const getMe = async (token: string) => {
  const response = await api.get('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export const completeRegistrationApi = async (username: string, role: string) => {
  // توکن به صورت خودکار توسط اینستنس api شما (اگر اینترسپتور دارد) یا دستی ارسال می‌شود
  const response = await api.put('/auth/complete-registration', {
    username,
    role,
  })
  return response.data
}

export const checkLoginMethod = async (identifier: string) => {
  const response = await api.post('/auth/check-login-method', {
    identifier,
  })

  return response.data
}

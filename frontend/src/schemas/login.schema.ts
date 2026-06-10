import { z } from 'zod'

export const loginSchema = z
  .string()
  .trim()
  .min(1, 'لطفاً ایمیل یا شماره موبایل را وارد کنید')
  .refine(
    (value) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

      const isPhone = /^09\d{9}$/.test(value)

      return isEmail || isPhone
    },
    {
      message: 'ایمیل یا شماره موبایل وارد شده معتبر نیست',
    },
  )

export type LoginSchema = z.infer<typeof loginSchema>

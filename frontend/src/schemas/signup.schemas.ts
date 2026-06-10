import { z } from 'zod'

export const registerSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'شماره موبایل را وارد کنید',
      })

      return
    }

    if (!value.startsWith('09')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'شماره موبایل باید با 09 شروع شود',
      })

      return
    }

    if (!/^\d+$/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'شماره موبایل فقط باید شامل عدد باشد',
      })

      return
    }

    if (value.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'شماره موبایل باید 11 رقم باشد',
      })
    }
  })

export type RegisterSchema = z.infer<typeof registerSchema>

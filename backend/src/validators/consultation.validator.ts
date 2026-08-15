import { z } from "zod";

export const createConsultationSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "نام الزامی است" : "نام باید رشته باشد",
    })
    .trim()
    .min(1, { error: "لطفا نام خود را وارد کنید" }),

  phone: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "شماره موبایل الزامی است"
          : "شماره موبایل باید رشته باشد",
    })
    .trim()
    .regex(/^09\d{9}$/, {
      error: "شماره موبایل باید به صورت 09XXXXXXXXX باشد",
    }),

  email: z
    .union([
      z.string().trim().email({ error: "ایمیل معتبر نیست" }),
      z.literal(""),
    ])
    .optional(),

  projectType: z.enum(["ground", "aerial", "gis", "unknown"], {
    error: () => ({ message: "نوع پروژه نامعتبر است" }),
  }),

  description: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "توضیحات الزامی است"
          : "توضیحات باید رشته باشد",
    })
    .trim()
    .min(10, { error: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),

  contactTime: z
    .union([z.enum(["morning", "noon", "evening"]), z.literal("")])
    .optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;

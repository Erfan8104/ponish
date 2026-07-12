// src/validators/profile.validator.ts

import { z } from "zod";

export const employerProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "نام الزامی است"),

    phone: z.string().trim().min(10, "شماره تماس معتبر نیست"),

    email: z.string().trim().email("ایمیل معتبر نیست"),

    password: z
      .string()
      .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد")
      .optional(),

    province: z.string().trim().optional(),

    city: z.string().trim().optional(),

    companyName: z.string().trim().optional(),

    companyType: z.string().trim().optional(),

    website: z.string().trim().optional(),

    address: z.string().trim().optional(),

    avatar: z.string().optional(),
  }),
});

export const freelancerProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "نام الزامی است"),

    phone: z.string().trim().min(10, "شماره تماس معتبر نیست"),

    email: z.string().trim().email("ایمیل معتبر نیست"),

    password: z
      .string()
      .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد")
      .optional(),

    province: z.string().trim().optional(),

    city: z.string().trim().optional(),

    birthDate: z.string().optional(),

    birthPlace: z.string().optional(),

    education: z.string().optional(),

    experience: z.string().optional(),

    hourlyRate: z.union([z.string(), z.number()]).optional(),

    portfolioUrl: z.string().optional(),

    skillIds: z.any().optional(),

    avatar: z.string().optional(),
  }),
});

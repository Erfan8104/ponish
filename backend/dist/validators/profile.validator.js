"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freelancerProfileSchema = exports.employerProfileSchema = void 0;
const zod_1 = require("zod");
exports.employerProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "نام الزامی است"),
    phone: zod_1.z.string().min(1, "شماره تماس الزامی است"),
    email: zod_1.z.string().email("ایمیل معتبر نیست").optional().or(zod_1.z.literal("")),
    province: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    companyType: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
});
exports.freelancerProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "نام الزامی است"),
    phone: zod_1.z.string().min(1, "شماره تماس الزامی است"),
    email: zod_1.z.string().email("ایمیل معتبر نیست").optional().or(zod_1.z.literal("")),
    province: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().optional(),
    birthPlace: zod_1.z.string().optional(),
    education: zod_1.z.string().optional(),
    experience: zod_1.z.string().optional(),
    hourlyRate: zod_1.z.string().optional(),
    portfolioUrl: zod_1.z.string().optional(),
    skillIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()]))]).optional(),
    avatar: zod_1.z.string().optional(),
});

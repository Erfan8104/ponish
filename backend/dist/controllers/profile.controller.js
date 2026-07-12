"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFreelancerProfile = exports.updateEmployerProfile = exports.getMyProfile = void 0;
const prisma_1 = require("../lib/prisma");
/**
 * دریافت اطلاعات کامل پروفایل کاربر جاری
 */
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                employerProfile: true,
                freelancerProfile: {
                    include: {
                        skills: {
                            include: {
                                skill: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "کاربر یافت نشد",
            });
        }
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت اطلاعات پروفایل",
        });
    }
};
exports.getMyProfile = getMyProfile;
/**
 * آپدیت پروفایل کارفرما
 */
const updateEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, email, province, city, companyName, companyType, website, address, } = req.body;
        // 🌟 استخراج مسیر فایل آواتار در صورت آپلود شدن توسط مالتر
        let avatarPath = req.body.avatar;
        if (req.file) {
            // اگر فرانت فایل فرستاده باشد، مسیر فایل ذخیره شده را برمیداریم
            avatarPath = `/uploads/${req.file.filename}`; // یا req.file.path بسته به تنظیمات آپلودتان
        }
        // استفاده از Transaction برای امنیت و یکپارچگی داده‌ها
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // ۱. آپدیت اطلاعات اصلی در جدول کاربر
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    name,
                    phone,
                    email,
                    avatar: avatarPath,
                    province,
                    city,
                    role: "employer", // مقدار انوم دقیقاً مطابق اسکیما
                    profileCompleted: true,
                },
            });
            // ۲. آپدیت یا ایجاد پروفایل کارفرما
            const profile = await tx.employerProfile.upsert({
                where: { userId },
                update: {
                    companyName,
                    companyType,
                    website,
                    address,
                },
                create: {
                    userId,
                    companyName,
                    companyType,
                    website,
                    address,
                },
            });
            return { user: updatedUser, profile };
        });
        return res.json({
            success: true,
            message: "پروفایل کارفرما با موفقیت به‌روزرسانی شد",
            data: result,
        });
    }
    catch (error) {
        console.error("Error updating employer profile:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ذخیره پروفایل کارفرما",
        });
    }
};
exports.updateEmployerProfile = updateEmployerProfile;
/**
 * آپدیت پروفایل فریلنسر
 */
const updateFreelancerProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, phone, email, province, city, birthDate, birthPlace, education, experience, hourlyRate, portfolioUrl, skillIds, // این از فرانت به صورت رشته جی‌سان می‌آید
         } = req.body;
        // 🌟 ۱. هماهنگی با فرانت برای فایل آواتار
        let avatarPath = req.body.avatar;
        if (req.file) {
            avatarPath = `/uploads/${req.file.filename}`;
        }
        // 🌟 ۲. تبدیل رشته جی‌سانِ مهارت‌ها به آرایه عددی واقعی جهت استفاده در پرایزما
        let parsedSkillIds = [];
        if (skillIds) {
            try {
                parsedSkillIds =
                    typeof skillIds === "string" ? JSON.parse(skillIds) : skillIds;
            }
            catch (e) {
                parsedSkillIds = [];
            }
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // ۱. آپدیت اطلاعات اصلی در جدول کاربر
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    name,
                    phone,
                    email,
                    avatar: avatarPath,
                    province,
                    city,
                    role: "freelancer",
                    profileCompleted: true,
                },
            });
            // ۲. مدیریت مهارت‌ها (ابتدا مهارت‌های قبلی حذف و سپس مهارت‌های جدید ثبت می‌شوند)
            if (Array.isArray(parsedSkillIds)) {
                // پیدا کردن پروفایل فریلنسر اگر از قبل وجود دارد برای پاک کردن مهارت‌های قدیمی
                const existingProfile = await tx.freelancerProfile.findUnique({
                    where: { userId },
                });
                if (existingProfile) {
                    await tx.freelancerSkill.deleteMany({
                        where: { freelancerProfileId: existingProfile.id },
                    });
                }
            }
            // آماده‌سازی مهارت‌های جدید برای ساخت همزمان (Nested Write)
            const skillsConnection = Array.isArray(parsedSkillIds)
                ? {
                    create: parsedSkillIds.map((id) => ({
                        skillId: Number(id), // تبدیل حتمی به عدد برای دیتابیس
                        level: "intermediate",
                    })),
                }
                : undefined;
            // ۳. آپدیت یا ایجاد پروفایل فریلنسر
            const profile = await tx.freelancerProfile.upsert({
                where: { userId },
                update: {
                    birthDate,
                    birthPlace,
                    education,
                    experience,
                    portfolioUrl,
                    hourlyRate: hourlyRate ? Number(hourlyRate) : null, // هندل کردن فرمت Decimal
                    skills: skillsConnection,
                },
                create: {
                    userId,
                    birthDate,
                    birthPlace,
                    education,
                    experience,
                    portfolioUrl,
                    hourlyRate: hourlyRate ? Number(hourlyRate) : null,
                    skills: skillsConnection,
                },
                include: {
                    skills: {
                        include: { skill: true },
                    },
                },
            });
            return { user: updatedUser, profile };
        });
        return res.json({
            success: true,
            message: "پروفایل فریلنسر با موفقیت به‌روزرسانی شد",
            data: result,
        });
    }
    catch (error) {
        console.error("Error updating freelancer profile:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ذخیره پروفایل فریلنسر",
        });
    }
};
exports.updateFreelancerProfile = updateFreelancerProfile;

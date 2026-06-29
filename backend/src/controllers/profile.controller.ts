import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * آپدیت پروفایل کارفرما
 */
export const updateEmployerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.userId;
    const {
      name,
      phone,
      email,
      avatar,
      province,
      city,
      companyName,
      companyType,
      website,
      address,
    } = req.body;

    // استفاده از Transaction برای امنیت و یکپارچگی داده‌ها
    const result = await prisma.$transaction(async (tx) => {
      // ۱. آپدیت اطلاعات اصلی در جدول کاربر
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          email,
          avatar,
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
  } catch (error) {
    console.error("Error updating employer profile:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در ذخیره پروفایل کارفرما",
    });
  }
};

/**
 * آپدیت پروفایل فریلنسر
 */
export const updateFreelancerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.userId;
    const {
      name,
      phone,
      email,
      avatar,
      province,
      city,
      birthDate,
      birthPlace,
      education,
      experience,
      hourlyRate,
      portfolioUrl,
      skillIds, // آرایه‌ای از ID مهارت‌ها که از فرانت می‌آید: [1, 4, 7]
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // ۱. آپدیت اطلاعات اصلی در جدول کاربر
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          email,
          avatar,
          province,
          city,
          role: "freelancer",
          profileCompleted: true,
        },
      });

      // ۲. مدیریت مهارت‌ها (ابتدا مهارت‌های قبلی حذف و سپس مهارت‌های جدید ثبت می‌شوند)
      // این بخش در صورت ارسال skillIds فعال می‌شود
      let skillsConnection = {};
      if (skillIds && Array.isArray(skillIds)) {
        // پیدا کردن پروفایل فریلنسر اگر از قبل وجود دارد برای پاک کردن مهارت‌های قدیمی
        const existingProfile = await tx.freelancerProfile.findUnique({
          where: { userId },
        });
        if (existingProfile) {
          await tx.freelancerSkill.deleteMany({
            where: { freelancerProfileId: existingProfile.id },
          });
        }

        // آماده‌سازی مهارت‌های جدید برای ساخت همزمان (Nested Write)
        skillsConnection = {
          create: skillIds.map((id: number) => ({
            skillId: id,
            level: "intermediate", // می‌توانید رتبه مهارتی پیش‌فرض بگذارید
          })),
        };
      }

      // ۳. آپدیت یا ایجاد پروفایل فریلنسر
      const profile = await tx.freelancerProfile.upsert({
        where: { userId },
        update: {
          birthDate,
          birthPlace,
          education,
          experience,
          portfolioUrl,
          hourlyRate,
          skills: skillsConnection,
        },
        create: {
          userId,
          birthDate,
          birthPlace,
          education,
          experience,
          portfolioUrl,
          hourlyRate,
          skills: skillsConnection,
        },
        include: {
          skills: true, // بازگرداندن مهارت‌ها در پاسخ خروجی
        },
      });

      return { user: updatedUser, profile };
    });

    return res.json({
      success: true,
      message: "پروفایل فریلنسر با موفقیت به‌روزرسانی شد",
      data: result,
    });
  } catch (error) {
    console.error("Error updating freelancer profile:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در ذخیره پروفایل فریلنسر",
    });
  }
};

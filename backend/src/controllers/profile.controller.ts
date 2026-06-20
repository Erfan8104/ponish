import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const updateEmployerProfile = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.userId;
    const { name, phone, email, avatar, province, city, company } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        email,
        avatar,
        role: "employer",
        profileCompleted: true,
        province,
        city,
        company,

        // فیلدهای freelancer را پاک می‌کنیم
        birthDate: null,
        birthPlace: null,
        freelancerProvince: null,
        freelancerCity: null,
        education: null,
        skills: null,
        experience: null,
      },
    });

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "خطا در ذخیره پروفایل کارفرما",
    });
  }
};

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
      birth_date,
      birth_place,
      province,
      city,
      education,
      skills,
      experience,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        email,
        avatar,
        role: "freelancer",
        profileCompleted: true,
        birthDate: birth_date,
        birthPlace: birth_place,
        freelancerProvince: province,
        freelancerCity: city,
        education,
        skills,
        experience,

        // فیلدهای employer را پاک می‌کنیم
        province: null,
        city: null,
        company: null,
      },
    });

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "خطا در ذخیره پروفایل فریلنسر",
    });
  }
};

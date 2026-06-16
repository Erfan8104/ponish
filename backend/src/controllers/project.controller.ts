import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "./../middleware/auth.middleware"; // ایمپورت تایپ اختصاصی خودت
import { CreateProjectInput } from "./../types/project.interface";

const prisma = new PrismaClient();

// ۱. کنترلر دریافت پروژه‌های اختصاصی کاربر لاگین شده
export const getUserProjects = async (req: AuthRequest, res: Response) => {
  try {
    // اطلاعات کاربر به لطف میدل‌ور تو در req.user در دسترس است
    const userId = req.user?.userId;

    const projects = await prisma.project.findMany({
      where: {
        userId: userId, // فیلتر دقیق بر اساس کاربر
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return res.status(500).json({
      success: false,
      message: "خطایی در دریافت اطلاعات پروژه‌ها رخ داده است.",
    });
  }
};

// ۲. کنترلر ساخت پروژه جدید متصل به کاربر
export const createProject = async (
  req: AuthRequest, // استفاده از اینستنس خودت
  res: Response,
) => {
  try {
    const data = req.body as unknown as CreateProjectInput;
    const userId = req.user?.userId; // دریافت آی‌دی کاربر از میدل‌ور امنیتی شما

    if (!data.title || !data.province || !data.city) {
      res
        .status(400)
        .json({ success: false, message: "اطلاعات اجباری وارد نشده است." });
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        province: data.province,
        city: data.city,
        address: data.address,
        areaSelectionMethod: data.areaSelectionMethod,
        polygonCoordinates: data.polygonCoordinates, // دیتابیس پستگرس مستقیما جی‌سان قبول می‌کند
        geoJson: data.geoJson,
        calculatedArea: Number(data.calculatedArea) || 0,
        coordinateSystem: data.coordinateSystem,
        utmZone: data.utmZone,
        techType: data.techType, // مدل String[] با مایگریشن قبلی کاملا سازگار است
        outputFormats: data.outputFormats,
        requiredAccuracy: data.requiredAccuracy,
        deliveryTime: data.deliveryTime,
        budgetType: data.budgetType,
        minBudget: data.minBudget,
        maxBudget: data.maxBudget,

        // چسباندن پروژه به کاربر لاگین شده
        userId: userId!,
      },
    });

    res.status(201).json({
      success: true,
      message: "پروژه با موفقیت ثبت شد.",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res
      .status(500)
      .json({ success: false, message: "خطایی در سرور رخ داده است." });
  }
};

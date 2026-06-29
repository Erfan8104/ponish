import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validator";

// تابع کمکی برای پیش‌پردازش داده‌های ورودی مالتی‌پارت قبل از سپردن به زاد
const preprocessMultipartData = (body: any) => {
  const processed = { ...body };

  // ۱. تبدیل آرایه‌های متنی جی‌سان به آرایه‌های واقعی جاوااسکریپت
  if (typeof processed.techType === "string") {
    try {
      processed.techType = JSON.parse(processed.techType);
    } catch {
      /* بدفرمت */
    }
  }
  if (typeof processed.outputFormats === "string") {
    try {
      processed.outputFormats = JSON.parse(processed.outputFormats);
    } catch {
      /* بدفرمت */
    }
  }
  if (typeof processed.polygonCoordinates === "string") {
    try {
      processed.polygonCoordinates = JSON.parse(processed.polygonCoordinates);
    } catch {
      /* بدفرمت */
    }
  }
  if (typeof processed.geoJson === "string") {
    try {
      processed.geoJson = JSON.parse(processed.geoJson);
    } catch {
      /* بدفرمت */
    }
  }

  // ۲. تبدیل متون عددی به عدد واقعی برای سازگاری با Zod number
  if (
    processed.calculatedArea !== undefined &&
    processed.calculatedArea !== ""
  ) {
    processed.calculatedArea = Number(processed.calculatedArea);
  }

  return processed;
};

// ۱. ثبت پروژه جدید
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const employerId = req.user!.userId;
    console.log("========= req.body =========");
    console.log(req.body);

    console.log("========= req.files =========");
    console.log(req.files);

    // پیش‌پردازش داده‌های ورودی دریافتی از FormData فرانت‌اَند
    const processedBody = preprocessMultipartData(req.body);
    console.log("========= processedBody =========");
    console.log(processedBody);

    const validation = createProjectSchema.safeParse(processedBody);
    if (!validation.success) {
      return res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
    }

    const data = validation.data;
    let categoryId: number | null = null;
    if (data.category) {
      const foundCategory = await prisma.category.findUnique({
        where: { slug: data.category },
      });
      if (foundCategory) categoryId = foundCategory.id;
    }
    console.log("شروع ذخیره پروژه...");
    const newProject = await prisma.project.create({
      data: {
        employerId,
        categoryId,
        title: data.title ?? "", // 👈 اگر خالی بود null رد شود
        description: data.description ?? "", // 👈 اگر خالی بود null رد شود
        status: "open",
        province: data.province ?? null,
        city: data.city ?? null,
        address: data.address ?? null,
        areaSelectionMethod: data.areaSelectionMethod ?? "map",
        calculatedArea: data.calculatedArea ?? null,
        coordinateSystem: data.coordinateSystem ?? null,
        utmZone: data.utmZone ?? null,
        requiredAccuracy: data.requiredAccuracy ?? null,
        deliveryTime: data.deliveryTime ?? null,
        budgetType: data.budgetType ?? "fixed",
        minBudget: data.minBudget ? Number(data.minBudget) : null,
        maxBudget: data.maxBudget ? Number(data.maxBudget) : null,
        polygonCoordinates: data.polygonCoordinates
          ? (data.polygonCoordinates as any)
          : null,
        geoJson: data.geoJson ? (data.geoJson as any) : null,
        techType: data.techType ? (data.techType as any) : null,
        outputFormats: data.outputFormats ? (data.outputFormats as any) : null,
      },
    });
    console.log("پروژه ذخیره شد:", newProject);

    return res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    // خط زیر را اضافه کنید تا متوجه پیام خطای اصلی پریسما بشوید
    console.error("❌ خطای دقیق پریسما:", error);

    return res
      .status(500)
      .json({ success: false, message: "خطای سرور در ثبت پروژه" });
  }
};

// ۲. گرفتن لیست پروژه‌ها همراه با فیلتر و صفحه‌بندی
export const getProjects = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      province,
      city,
      budgetType,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      deletedAt: null,
      status: "open",
    };

    if (category) {
      whereClause.category = { slug: String(category) };
    }
    if (province) whereClause.province = String(province);
    if (city) whereClause.city = String(city);
    if (budgetType) whereClause.budgetType = budgetType;
    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          employer: { select: { name: true, avatar: true } },
        },
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return res.json({
      success: true,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      projects,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست پروژه‌ها" });
  }
};

// ۳. دریافت جزئیات یک پروژه منحصر به فرد
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        employer: { select: { name: true, avatar: true } },
        proposals: true,
      },
    });

    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    await prisma.project.update({
      where: { id: Number(id) },
      data: { viewCount: { increment: 1 } },
    });

    return res.json({ success: true, project });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت جزئیات پروژه" });
  }
};

// ۴. ویرایش پروژه
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employerId = req.user!.userId;

    const processedBody = preprocessMultipartData(req.body);

    const validation = updateProjectSchema.safeParse(processedBody);
    if (!validation.success) {
      return res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });
    if (!project || project.deletedAt)
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    if (project.employerId !== employerId)
      return res.status(403).json({
        success: false,
        message: "شما دسترسی ویرایش این پروژه را ندارید",
      });

    if (project.status !== "draft" && project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "پروژه‌ای که وارد فرآیند اجرا شده را نمی‌توان ویرایش کرد",
      });
    }

    const data = validation.data;
    let categoryId = project.categoryId;
    if (data.category) {
      const foundCategory = await prisma.category.findUnique({
        where: { slug: data.category },
      });
      if (foundCategory) categoryId = foundCategory.id;
    }

    const updated = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...data,
        category: undefined,
        categoryId,
        minBudget: data.minBudget ? Number(data.minBudget) : undefined,
        maxBudget: data.maxBudget ? Number(data.maxBudget) : undefined,
      },
    });

    return res.json({
      success: true,
      message: "پروژه با موفقیت به‌روزرسانی شد",
      project: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در به‌روزرسانی پروژه" });
  }
};

// ۵. حذف پروژه
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employerId = req.user!.userId;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });
    if (!project || project.deletedAt)
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    if (project.employerId !== employerId)
      return res.status(403).json({
        success: false,
        message: "شما دسترسی حذف این پروژه را ندارید",
      });

    if (project.status !== "draft" && project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "امکان حذف پروژه‌های در حال اجرا یا منقضی شده وجود ندارد",
      });
    }

    await prisma.project.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date(), status: "cancelled" },
    });

    return res.json({ success: true, message: "پروژه با موفقیت حذف شد" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف پروژه" });
  }
};

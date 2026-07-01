import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { Prisma } from "@prisma/client"; // 👈 اضافه شد برای مدیریت فیلدهای دسیماال
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
  if (processed.projectId !== undefined) {
    processed.projectId = Number(processed.projectId);
  }

  return processed;
};

// ۱. ثبت پروژه جدید
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const employerId = Number(req.user!.userId); // 👈 اطمینان از Number بودن id

    const processedBody = preprocessMultipartData(req.body);

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

    const newProject = await prisma.project.create({
      data: {
        employerId,
        categoryId,
        title: data.title ?? "",
        description: data.description ?? "",
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
        minBudget: data.minBudget ? new Prisma.Decimal(data.minBudget) : null, // 👈 اصلاح به دسیماال پریسما
        maxBudget: data.maxBudget ? new Prisma.Decimal(data.maxBudget) : null, // 👈 اصلاح به دسیماال پریسما
        polygonCoordinates: data.polygonCoordinates
          ? (data.polygonCoordinates as any)
          : null,
        geoJson: data.geoJson ? (data.geoJson as any) : null,
        techType: data.techType ? (data.techType as any) : null,
        outputFormats: data.outputFormats ? (data.outputFormats as any) : null,
      },
    });

    return res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error("❌ خطای دقیق پریسما در ثبت پروژه:", error);
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
    const whereClause: any = { deletedAt: null, status: "open" };

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
    const employerId = Number(req.user!.userId);

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

    // جدا کردن فیلد سفارشی برای جلوگیری از ناهماهنگی ریلیشن در پریسما
    const { category, ...updateData } = data as any;

    const updated = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...updateData,
        categoryId,
        minBudget: data.minBudget
          ? new Prisma.Decimal(data.minBudget)
          : undefined,
        maxBudget: data.maxBudget
          ? new Prisma.Decimal(data.maxBudget)
          : undefined,
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
    const employerId = Number(req.user!.userId);

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

// 🌟 ۶. ارسال پیشنهاد جدید توسط فریلنسر روی پروژه (کامل و بدون باگ)
export const submitProposal = async (req: AuthRequest, res: Response) => {
  try {
    const freelancerId = Number(req.user!.userId); // 👈 تبدیل مطمئن به Number برای هماهنگی با کلید خارجی
    const { projectId, amount, deliveryDays, coverLetter } = req.body;

    if (!projectId || !amount || !deliveryDays || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "وارد کردن تمامی فیلدهای پیشنهاد الزامی است",
      });
    }

    const targetProjectId = Number(projectId);

    // ۱. بررسی یکتا بودن پیشنهاد براساس کلید ترکیبی یکتای دیتابیس (@@unique([projectId, freelancerId]))
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: {
          projectId: targetProjectId,
          freelancerId: freelancerId,
        },
      },
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: "شما قبلاً پیشنهاد خود را برای این پروژه ثبت کرده‌اید",
      });
    }

    // ۲. بررسی وجود داشتن و فعال بودن پروژه هدف
    const targetProject = await prisma.project.findUnique({
      where: { id: targetProjectId },
    });

    if (
      !targetProject ||
      targetProject.deletedAt ||
      targetProject.status !== "open"
    ) {
      return res.status(404).json({
        success: false,
        message: "پروژه مد نظر یافت نشد یا در وضعیت دریافت پیشنهاد نیست",
      });
    }

    // ۳. درج نهایی با کستینگ دقیق فیلد مقدار فیکس شده به Decimal پریسما
    const newProposal = await prisma.proposal.create({
      data: {
        projectId: targetProjectId,
        freelancerId: freelancerId,
        amount: new Prisma.Decimal(amount), // 👈 حل مشکل باگ نوع داده Decimal در Postgres
        deliveryDays: Number(deliveryDays),
        coverLetter: String(coverLetter).trim(),
        status: "pending",
      },
    });

    return res.status(201).json({
      success: true,
      message: "پیشنهاد قیمت شما با موفقیت ثبت شد",
      proposal: newProposal,
    });
  } catch (error) {
    console.error("❌ خطای دقیق ثبت پیشنهاد فریلنسر:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطای سرور در ثبت پیشنهاد پروژه" });
  }
};

// 🌟 ۷. دریافت پروژه‌های کارفرما (خود کاربر)
export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId); // 👈 اینجا مهم است!

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "احراز هویت نشده‌اید",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        employerId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        attachments: {
          select: { id: true, fileName: true, fileUrl: true, fileType: true },
        },
        proposals: {
          select: {
            id: true,
            status: true,
            amount: true,
            deliveryDays: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error: any) {
    console.error("خطا در دریافت پروژه‌های من:", error);
    res.status(500).json({
      success: false,
      message: "خطای سرور در دریافت پروژه‌ها",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

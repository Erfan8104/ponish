import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { Prisma } from "@prisma/client";
import { createProjectSchema } from "../validators/project.validator";
import { updateProjectSchema } from "../validators/project.validator";

/**
 * =========================
 * Helper: normalize multipart body
 * =========================
 */
const preprocessMultipartData = (body: any) => {
  const processed = { ...body };

  if (typeof processed.techType === "string") {
    try {
      processed.techType = JSON.parse(processed.techType);
    } catch {}
  }

  if (typeof processed.outputFormats === "string") {
    try {
      processed.outputFormats = JSON.parse(processed.outputFormats);
    } catch {}
  }

  if (typeof processed.polygonCoordinates === "string") {
    try {
      processed.polygonCoordinates = JSON.parse(processed.polygonCoordinates);
    } catch {}
  }

  if (typeof processed.geoJson === "string") {
    try {
      processed.geoJson = JSON.parse(processed.geoJson);
    } catch {}
  }

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

/**
 * =========================
 * 1. Create Project (WITH FILES)
 * =========================
 */
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const employerId = Number(req.user!.userId);

    const processedBody = preprocessMultipartData(req.body);

    const validation = createProjectSchema.safeParse(processedBody);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.issues,
      });
    }

    const data = validation.data;

    let categoryId: number | null = null;

    if (data.category) {
      const foundCategory = await prisma.category.findUnique({
        where: { slug: data.category },
      });

      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }

    /**
     * =========================
     * Transaction (Project + Files)
     * =========================
     */
    const result = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
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
          minBudget: data.minBudget ? new Prisma.Decimal(data.minBudget) : null,
          maxBudget: data.maxBudget ? new Prisma.Decimal(data.maxBudget) : null,
          polygonCoordinates: data.polygonCoordinates ?? "",
          geoJson: data.geoJson ?? null,
          techType: data.techType ?? "",
          outputFormats: data.outputFormats ?? "",
        },
      });

      /**
       * =========================
       * Save attachments (FILES)
       * =========================
       */
      const files = req.files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        for (const file of files) {
          await tx.projectAttachment.create({
            data: {
              projectId: newProject.id,
              fileName: file.originalname,
              fileUrl: `/uploads/projects/${file.filename}`,
              fileType: file.mimetype,
              fileSize: file.size,
            },
          });
        }
      }

      return newProject;
    });

    return res.status(201).json({
      success: true,
      project: result,
    });
  } catch (error) {
    console.error("❌ createProject error:", error);

    return res.status(500).json({
      success: false,
      message: "خطا در ثبت پروژه",
    });
  }
};

/**
 * =========================
 * 2. Get Projects (public feed)
 * =========================
 */
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
        {
          title: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: String(search),
            mode: "insensitive",
          },
        },
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
          employer: {
            select: { name: true, avatar: true },
          },
          attachments: true,
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
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست پروژه‌ها",
    });
  }
};

/**
 * =========================
 * 3. Get Project By ID
 * =========================
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        employer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        attachments: true,

        contract: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "پروژه یافت نشد",
      });
    }

    const proposalCount = await prisma.proposal.count({
      where: {
        projectId: Number(id),
      },
    });

    const projectResponse = {
      ...project,

      canEdit: !project.contract,

      canDelete: !project.contract,

      proposalCount,

      attachmentCount: project.attachments.length,
    };
    await prisma.project.update({
      where: { id: Number(id) },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return res.json({
      success: true,
      project: projectResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت جزئیات پروژه",
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employerId = Number(req.user!.userId);

    const processedBody = { ...req.body };

    const validation = updateProjectSchema.safeParse(processedBody);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.issues,
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "پروژه یافت نشد",
      });
    }

    if (project.employerId !== employerId) {
      return res.status(403).json({
        success: false,
        message: "دسترسی ندارید",
      });
    }

    if (project.status !== "draft" && project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "این پروژه قابل ویرایش نیست",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id: Number(id) },
        data: {
          ...validation.data,
          minBudget: validation.data.minBudget
            ? new Prisma.Decimal(validation.data.minBudget)
            : undefined,
          maxBudget: validation.data.maxBudget
            ? new Prisma.Decimal(validation.data.maxBudget)
            : undefined,
        },
      });

      /**
       * =========================
       * ADD NEW FILES (NOT REPLACE)
       * =========================
       */
      const files = req.files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        for (const file of files) {
          await tx.projectAttachment.create({
            data: {
              projectId: updatedProject.id,
              fileName: file.originalname,
              fileUrl: `/uploads/projects/${file.filename}`,
              fileType: file.mimetype,
              fileSize: file.size,
            },
          });
        }
      }

      return updatedProject;
    });

    return res.json({
      success: true,
      message: "پروژه بروزرسانی شد",
      project: updated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "خطا در بروزرسانی پروژه",
    });
  }
};

/**
 * =========================
 * 5. DELETE PROJECT (SOFT DELETE)
 * =========================
 */
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employerId = Number(req.user!.userId);

    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "پروژه یافت نشد",
      });
    }

    if (project.employerId !== employerId) {
      return res.status(403).json({
        success: false,
        message: "دسترسی ندارید",
      });
    }

    if (project.status !== "draft" && project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "امکان حذف این پروژه وجود ندارد",
      });
    }

    await prisma.project.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
        status: "cancelled",
      },
    });

    return res.json({
      success: true,
      message: "پروژه حذف شد",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "خطا در حذف پروژه",
    });
  }
};

/**
 * =========================
 * 6. SUBMIT PROPOSAL
 * =========================
 */
export const submitProposal = async (req: AuthRequest, res: Response) => {
  try {
    const freelancerId = Number(req.user!.userId);

    const { projectId, amount, deliveryDays, coverLetter } = req.body;

    if (!projectId || !amount || !deliveryDays || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: "تمام فیلدها الزامی است",
      });
    }

    const targetProjectId = Number(projectId);

    console.log("Logged User:", req.user);
    console.log("FreelancerId:", freelancerId);

    // بررسی وجود پروژه
    const project = await prisma.project.findUnique({
      where: {
        id: targetProjectId,
      },
      select: {
        employerId: true,
        deletedAt: true,
        status: true,
      },
    });

    if (!project || project.deletedAt || project.status !== "open") {
      return res.status(404).json({
        success: false,
        message: "پروژه در دسترس نیست",
      });
    }

    // جلوگیری از ثبت پیشنهاد روی پروژه خود
    if (project.employerId === freelancerId) {
      return res.status(400).json({
        success: false,
        message: "نمی‌توانید برای پروژه خودتان پیشنهاد ثبت کنید.",
      });
    }

    // بررسی نقش کاربر
    const user = await prisma.user.findUnique({
      where: {
        id: freelancerId,
      },
      select: {
        role: true,
      },
    });
    console.log("User From DB:", user);

    if (!user || (user.role !== "freelancer" && user.role !== "both")) {
      return res.status(403).json({
        success: false,
        message: "فقط فریلنسرها می‌توانند پیشنهاد ثبت کنند.",
      });
    }

    // جلوگیری از ثبت پیشنهاد تکراری
    const existing = await prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: {
          projectId: targetProjectId,
          freelancerId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "قبلاً پیشنهاد ثبت کرده‌اید",
      });
    }

    // ثبت پیشنهاد
    const proposal = await prisma.proposal.create({
      data: {
        projectId: targetProjectId,
        freelancerId,
        amount: new Prisma.Decimal(amount),
        deliveryDays: Number(deliveryDays),
        coverLetter: String(coverLetter).trim(),
        status: "pending",
      },
    });

    return res.status(201).json({
      success: true,
      message: "پیشنهاد ثبت شد",
      proposal,
    });
  } catch (error) {
    console.error("submitProposal error:", error);

    return res.status(500).json({
      success: false,
      message: "خطا در ثبت پیشنهاد",
    });
  }
};
/**
 * =========================
 * 7. GET MY PROJECTS
 * =========================
 */
export const getMyProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);

    const projects = await prisma.project.findMany({
      where: {
        employerId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        attachments: true,

        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت پروژه‌ها",
    });
  }
};

export const getProjectProposals = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = Number(req.params.id);
    const employerId = Number(req.user!.userId);
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        employerId: true,
        deletedAt: true,
      },
    });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "پروژه پیدا نشد",
      });
    }
    if (project.employerId !== employerId) {
      return res.status(403).json({
        success: false,
        message: "دسترسی ندارید",
      });
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            province: true,
          },
        },
      },
    });
    return res.status(200).json({
      success: true,
      proposals,
      count: proposals.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "خطا در دریافت پیشنهادها",
    });
  }
};

/**
 * =========================
 * 8. ACCEPT PROPOSAL & CREATE CONTRACT
 * =========================
 */
export const acceptProposal = async (req: AuthRequest, res: Response) => {
  try {
    const proposalId = Number(req.params.id);
    const employerId = Number(req.user!.userId);

    // ۱. بررسی وجود پیشنهاد و دریافت اطلاعات پروژه مرتبط
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        project: true,
      },
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "پیشنهاد مورد نظر یافت نشد.",
      });
    }

    // ۲. بررسی مالکیت پروژه (فقط کارفرمای همین پروژه مجاز است)
    if (proposal.project.employerId !== employerId) {
      return res.status(403).json({
        success: false,
        message: "شما دسترسی لازم برای تایید این پیشنهاد را ندارید.",
      });
    }

    // ۳. بررسی وضعیت پروژه و پیشنهاد (نباید قبلاً نهایی شده باشند)
    if (proposal.project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "پروژه در وضعیت باز قرار ندارد یا پیش از این تایید شده است.",
      });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "این پیشنهاد قبلاً تعیین تکلیف شده است.",
      });
    }

    /**
     * اجرای تراکنش دیتابیس برای حفظ یکپارچگی داده‌ها مالی و ساختاری
     */
    const result = await prisma.$transaction(async (tx) => {
      // الف) تغییر وضعیت پیشنهاد انتخاب شده به accepted
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      });

      // ب) تغییر وضعیت پروژه به in_progress (در حال انجام)
      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });

      // ج) رد کردن خودکار سایر پیشنهادهای ثبت شده برای این پروژه
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: "pending",
        },
        data: { status: "rejected" },
      });

      // د) ایجاد خودکار قرارداد (Contract) جدید بر اساس مقادیر توافق شده فریلنسر
      const newContract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          employerId: employerId,
          freelancerId: proposal.freelancerId,
          totalAmount: proposal.amount,
          status: "active",
        },
      });

      return { updatedProposal, newContract };
    });

    return res.status(200).json({
      success: true,
      message: "پیشنهاد با موفقیت تایید شد و قرارداد آغاز گردید.",
      data: result,
    });
  } catch (error) {
    console.error("❌ acceptProposal error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در تایید پیشنهاد و ایجاد قرارداد",
    });
  }
};

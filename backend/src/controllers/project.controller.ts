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

  Object.keys(processed).forEach((key) => {
    if (
      processed[key] === "" ||
      processed[key] === "null" ||
      processed[key] === "undefined"
    ) {
      processed[key] = undefined; // تبدیل به undefined تا Zod فیلدهای optional را رد کند
    }
  });

  if (
    processed.calculatedArea !== undefined &&
    processed.calculatedArea !== "" &&
    processed.calculatedArea !== "null" &&
    !isNaN(Number(processed.calculatedArea))
  ) {
    processed.calculatedArea = Number(processed.calculatedArea);
  } else {
    processed.calculatedArea = undefined;
  }

  // اصلاح CorridorLength
  if (
    processed.corridorLength !== undefined &&
    processed.corridorLength !== "" &&
    processed.corridorLength !== "null" &&
    !isNaN(Number(processed.corridorLength))
  ) {
    processed.corridorLength = Number(processed.corridorLength);
  } else {
    processed.corridorLength = undefined;
  }
  if (typeof processed.techType === "string") {
    try {
      processed.techType = JSON.parse(processed.techType);
    } catch {}
  }
  if (typeof processed.terrainTypes === "string") {
    try {
      processed.terrainTypes = JSON.parse(processed.terrainTypes);
    } catch {
      processed.terrainTypes = [];
    }
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

  // 🌟 اضافه کردن پردازش فیلدهای جدید روش‌ها و تجهیزات
  if (typeof processed.surveyMethod === "string") {
    if (
      processed.surveyMethod === "" ||
      processed.surveyMethod === "null" ||
      processed.surveyMethod === "undefined"
    ) {
      processed.surveyMethod = null;
    }
  }

  if (typeof processed.specificSurveys === "string") {
    try {
      processed.specificSurveys = JSON.parse(processed.specificSurveys);
    } catch {
      processed.specificSurveys = [];
    }
  }

  if (typeof processed.requiredEquipment === "string") {
    try {
      processed.requiredEquipment = JSON.parse(processed.requiredEquipment);
    } catch {
      processed.requiredEquipment = [];
    }
  }
  // اصلاح بخش تبدیل بودجه‌ها
  if (
    processed.minBudget !== undefined &&
    processed.minBudget !== "" &&
    processed.minBudget !== "null"
  ) {
    processed.minBudget = Number(processed.minBudget);
  } else {
    processed.minBudget = undefined;
  }

  if (
    processed.maxBudget !== undefined &&
    processed.maxBudget !== "" &&
    processed.maxBudget !== "null"
  ) {
    processed.maxBudget = Number(processed.maxBudget);
  } else {
    processed.maxBudget = undefined;
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

    // 🌟 جای صحیح بررسی خطا: اگر اعتبارسنجی Zod رد شد
    if (!validation.success) {
      console.log("❌ Zod Validation Error Details:");
      console.log(
        JSON.stringify(validation.error.flatten().fieldErrors, null, 2),
      );

      return res.status(400).json({
        success: false,
        message: "خطای اعتبارسنجی داده‌ها",
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
          mappingType: data.mappingType ?? null, // اطمینان از ذخیره نوع
          surveyMethod: data.surveyMethod ?? null,
          specificSurveys: data.specificSurveys ?? [],
          requiredEquipment: data.requiredEquipment ?? [],

          // اصلاح منطق ذخیره سازی:
          // اگر مقدار وارد شده (حتی اگر type اشتباه باشد، داده از بین نرود)
          calculatedArea: data.calculatedArea ?? null,
          corridorLength: data.corridorLength ?? null,
          utmZone: data.utmZone ?? null,
          terrainTypes: data.terrainTypes ?? [],
          requiredAccuracy: data.requiredAccuracy ?? null,
          mapScale: data.mapScale ?? null,
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
    // در فایل controllers/project.controller.ts
    const validation = createProjectSchema.safeParse(processedBody);

    if (!validation.success) {
      // این لاگ را اضافه کنید تا بفهمید مشکل از کدام فیلد است
      console.log("Validation Errors:", validation.error.flatten().fieldErrors);

      return res.status(400).json({
        success: false,
        message: "خطای اعتبارسنجی",
        errors: validation.error.issues,
      });
    }

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
    const id = Number(req.params.id);

    console.log("Project ID:", id);

    const project = await prisma.project.findUnique({
      where: { id },
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

            employer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },

            freelancer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    console.log("Project Found:", project);

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "پروژه یافت نشد",
      });
    }

    const proposalCount = await prisma.proposal.count({
      where: {
        projectId: id,
      },
    });

    await prisma.project.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        canEdit: !project.contract,
        canDelete: !project.contract,
        proposalCount,
        attachmentCount: project.attachments.length,
      },
    });
  } catch (error) {
    console.error("getProjectById error:", error);

    return res.status(500).json({
      success: false,
      message: "خطا در دریافت جزئیات پروژه",
    });
  }
};

/**
 * =========================
 * 4. Update Project
 * =========================
 */
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
          mappingType: validation.data.mappingType,
          calculatedArea:
            validation.data.mappingType === "area"
              ? validation.data.calculatedArea
              : null,
          corridorLength:
            validation.data.mappingType === "corridor"
              ? validation.data.corridorLength
              : null,

          terrainTypes: validation.data.terrainTypes ?? undefined,
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

    if (project.employerId === freelancerId) {
      return res.status(400).json({
        success: false,
        message: "نمی‌توانید برای پروژه خودتان پیشنهاد ثبت کنید.",
      });
    }

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
 * 8. ACCEPT PROPOSAL & CREATE CONTRACT (SUPPORTING CHAT AGREEMENTS)
 * =========================
 */
export const acceptProposal = async (req: AuthRequest, res: Response) => {
  try {
    const proposalId = Number(req.params.id);
    const employerId = Number(req.user!.userId);
    const { finalAmount } = req.body;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد مورد نظر یافت نشد." });
    }

    if (proposal.project.employerId !== employerId) {
      return res
        .status(403)
        .json({ success: false, message: "شما دسترسی لازم را ندارید." });
    }

    // شرط پروژه را منعطف‌تر می‌کنیم تا اگر پروژه دوباره باز شد (وضعیت open)، قابل قبول باشد
    if (proposal.project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "پروژه در وضعیت مناسبی برای تایید پیشنهاد نیست.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ۱. آپدیت وضعیت پیشنهاد فعلی
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      });

      // ۲. آپدیت وضعیت پروژه
      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });

      // ۳. رد کردن سایر پیشنهادها
      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: "pending",
        },
        data: { status: "rejected" },
      });

      const contractAmount = finalAmount
        ? new Prisma.Decimal(finalAmount)
        : proposal.amount;

      // ۴. 🌟 استفاده از upsert به جای create برای جلوگیری از خطای Unique constraint
      const contract = await tx.contract.upsert({
        where: {
          projectId: proposal.projectId, // شرط پیدا کردن قرارداد قبلی
        },
        update: {
          proposalId: proposal.id,
          freelancerId: proposal.freelancerId,
          totalAmount: contractAmount,
          status: "active", // فعال کردن مجدد قرارداد
          cancelledAt: null, // پاک کردن تاریخ لغو قبلی
        },
        create: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          employerId: employerId,
          freelancerId: proposal.freelancerId,
          totalAmount: contractAmount,
          status: "active",
        },
      });

      return { updatedProposal, contract };
    });

    return res.status(200).json({
      success: true,
      message: "پیشنهاد با موفقیت تایید شد.",
      data: result,
    });
  } catch (error) {
    console.error("❌ acceptProposal error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در تایید پیشنهاد" });
  }
};
/**
 * =========================
 * 9. GET FREELANCER CONTRACTS (MY PROJECTS AS FREELANCER)
 * =========================
 */
export const getFreelancerContracts = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const freelancerId = Number(req.user!.userId);

    if (!freelancerId) {
      return res.status(401).json({
        success: false,
        message: "کاربر احراز هویت نشده است.",
      });
    }

    const contracts = await prisma.contract.findMany({
      where: {
        freelancerId: freelancerId,
        status: "active",
      },
      include: {
        project: {
          include: {
            category: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      contracts,
      count: contracts.length,
    });
  } catch (error) {
    console.error("❌ getFreelancerContracts error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت پروژه‌های فریلنسر",
    });
  }
};

/**
 * =========================
 * 10. GET ACCEPTED PROJECTS FOR FREELANCER
 * =========================
 */
export const getAcceptedProjects = async (req: AuthRequest, res: Response) => {
  try {
    const freelancerId = Number(req.user!.userId);

    const status = String(req.query.status || "all");

    let contractWhere: any = {
      freelancerId,
    };

    if (status === "active") {
      contractWhere.status = "active";
    } else if (status === "completed") {
      contractWhere.status = "completed";
    } else {
      contractWhere.status = {
        in: ["active", "completed"],
      };
    }

    const contracts = await prisma.contract.findMany({
      where: contractWhere,
      include: {
        project: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const projects = contracts.map((contract) => ({
      ...contract.project,
      contractId: contract.id,
      contractStatus: contract.status,
      totalAmount: contract.totalAmount,
      startedAt: contract.startedAt,
      completedAt: contract.completedAt,
    }));

    return res.status(200).json({
      success: true,
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("getAcceptedProjects error:", error);

    return res.status(500).json({
      success: false,
      message: "خطا در دریافت پروژه‌ها",
    });
  }
};

export const rejectAcceptedProposal = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    // ۱. اطمینان از دریافت پارامترها از req.params یا req.body
    // طبق روت شما که :contractId داشت، باید از params بگیرید:
    const contractId = Number(req.params.contractId);
    const { projectId } = req.body;
    const employerId = Number(req.user!.userId);

    // بررسی اینکه آیا IDها معتبر هستند
    if (isNaN(contractId) || isNaN(Number(projectId))) {
      return res
        .status(400)
        .json({ success: false, message: "شناسه نامعتبر است" });
    }

    // ... (بقیه کدهای بررسی مالکیت پروژه)

    await prisma.$transaction(async (tx) => {
      // الف) لغو قرارداد - حتما از متغیری که عدد شده استفاده کنید
      await tx.contract.update({
        where: { id: contractId }, // 👈 اینجا باید عدد باشد
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });

      // ب) بازگرداندن پروژه به وضعیت open
      await tx.project.update({
        where: { id: Number(projectId) },
        data: { status: "open" },
      });

      // ج) تغییر وضعیت پیشنهاد قبلی به rejected
      await tx.proposal.updateMany({
        where: { projectId: Number(projectId), status: "accepted" },
        data: { status: "rejected" },
      });
    });

    return res.status(200).json({ success: true, message: "توافق لغو شد" });
  } catch (error) {
    console.error(error); // برای دیدن جزئیات خطا در کنسول سرور
    return res
      .status(500)
      .json({ success: false, message: "خطا در لغو توافق" });
  }
};

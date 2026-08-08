import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

import crypto from "crypto";

// جایگزین getAllUsersForAdmin فعلی بشه
export const getAllUsersForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      role,
      status,
      verified,
      sortBy = "newest",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.isActive = status === "active";
    if (verified) where.isVerified = verified === "verified";

    const baseSelect = {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      profileCompleted: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { projects: true } },
    };

    let orderBy: any = { createdAt: sortBy === "oldest" ? "asc" : "desc" };
    if (sortBy === "projectsCount") orderBy = { projects: { _count: "desc" } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: baseSelect,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست کاربران" });
  }
};

export const getProjectDetailForAdmin = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        employer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        category: true,
        _count: {
          select: { proposals: true },
        },
        proposals: {
          include: {
            freelancer: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        contract: {
          include: {
            freelancer: {
              select: { id: true, name: true, phone: true },
            },
            milestones: true,
          },
        },
        attachments: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!project || project.deletedAt) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    return res.json({ success: true, project });
  } catch (error) {
    console.error("Get Project Detail Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت جزئیات پروژه" });
  }
};

export const getAllProjectsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      status,
      sortBy = "newest",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { employer: { name: { contains: search, mode: "insensitive" } } },
        { employer: { phone: { contains: search } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "budget") orderBy = { maxBudget: "desc" };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          minBudget: true,
          maxBudget: true,
          budgetType: true,
          isFeatured: true,

          createdAt: true,
          employer: {
            select: { name: true, phone: true },
          },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.project.count({ where }),
    ]);

    return res.json({
      success: true,
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست پروژه‌ها",
    });
  }
};
// جزئیات کامل یک کاربر
export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employerProfile: true,
        freelancerProfile: {
          include: { skills: { include: { skill: true } } },
        },
        projects: {
          select: { id: true, title: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        contractsAsEmployer: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            freelancer: { select: { name: true, phone: true } },
          },
        },
        contractsAsFreelancer: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            employer: { select: { name: true, phone: true } },
          },
        },
        reviewsGiven: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewed: { select: { name: true } },
          },
        },
        reviewsReceived: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: { select: { name: true } },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }

    const contractIds = [
      ...user.contractsAsEmployer.map((c) => c.id),
      ...user.contractsAsFreelancer.map((c) => c.id),
    ];

    const payments = contractIds.length
      ? await prisma.payment.findMany({
          where: { contractId: { in: contractIds } },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
      },
    });

    const { password, ...safeUser } = user;
    return res.json({ success: true, user: safeUser, payments, messages });
  } catch (error) {
    console.error("Get User Detail Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت جزئیات کاربر" });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { isVerified: true },
      select: { id: true, isVerified: true },
    });
    return res.json({ success: true, message: "کاربر تایید شد", user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در تایید کاربر" });
  }
};

// Soft delete
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true, deletedAt: true },
    });
    return res.json({ success: true, message: "کاربر حذف شد", user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف کاربر" });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const newPassword = crypto.randomBytes(4).toString("hex");
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { password: hashed },
    });

    // این رمز فقط همین یک بار در پاسخ برمی‌گردد و جایی ذخیره نمی‌شود
    return res.json({
      success: true,
      message: "رمز عبور بازنشانی شد",
      newPassword,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در بازنشانی رمز عبور" });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["employer", "freelancer", "both", "admin"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "نقش نامعتبر است" });
    }

    // فقط سوپر ادمین بتواند نقش admin بدهد
    // ⚠️ فرض شده req.user.permissions توسط authMiddleware ست می‌شود — چک کن با middleware واقعی‌ات هماهنگ باشد
    if (role === "admin") {
      const requesterPermissions = (req as any).user?.permissions || [];
      if (!requesterPermissions.includes("*")) {
        return res.status(403).json({
          success: false,
          message: "فقط سوپر ادمین می‌تواند نقش ادمین اختصاص دهد",
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
      select: { id: true, role: true },
    });

    return res.json({ success: true, message: "نقش کاربر تغییر یافت", user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در تغییر نقش" });
  }
};
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و رمز عبور الزامی هستند",
      });
    }

    // کاربر را همراه با نقش‌های ادمین و دسترسی‌ها پیدا کن
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        adminRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // یا role === "admin" باشد، یا حداقل یک نقش ادمین داشته باشد
    const hasAdminRole =
      user?.role === "admin" ||
      (user?.adminRoles && user.adminRoles.length > 0);

    if (!user || !hasAdminRole) {
      return res.status(401).json({
        success: false,
        message: "اطلاعات ورود نامعتبر است یا دسترسی ادمین ندارید",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "حساب کاربری شما غیرفعال شده است",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور برای این حساب تنظیم نشده است",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور اشتباه است",
      });
    }

    // استخراج نقش‌ها و دسترسی‌ها
    const adminRoles = user.adminRoles.map((ur) => ({
      name: ur.role.name,
      displayName: ur.role.displayName,
    }));

    const permissionsSet = new Set<string>();
    user.adminRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissionsSet.add(rp.permission.key);
      });
    });
    const permissions = Array.from(permissionsSet);

    // اگر نقش SUPER_ADMIN داشت، همه دسترسی‌ها را بده (اختیاری ولی مفید)
    const isSuperAdmin = adminRoles.some((r) => r.name === "SUPER_ADMIN");

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        adminRoles: adminRoles.map((r) => r.name),
        permissions: isSuperAdmin ? ["*"] : permissions, // * یعنی همه دسترسی‌ها
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        adminRoles,
        permissions: isSuperAdmin ? ["*"] : permissions,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای سرور در ورود ادمین",
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر مورد نظر یافت نشد",
      });
    }

    // جلوگیری از غیرفعال کردن خود ادمین (اختیاری)
    // if (user.role === "admin") { ... }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
      },
    });

    return res.json({
      success: true,
      message: `حساب کاربری با موفقیت ${updatedUser.isActive ? "فعال" : "غیرفعال"} شد`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در تغییر وضعیت کاربر",
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    // ---- آمار کلی ----
    const [
      usersCount,
      projectsCount,
      activeProjects,
      activeContracts,
      todayPaymentsCount,
      newUsersToday,
      revenueAgg,
      pendingReviews,
      latestUsers,
      latestProjects,
    ] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null, role: { not: "admin" } },
      }),
      prisma.project.count({
        where: { deletedAt: null },
      }),
      prisma.project.count({
        where: {
          deletedAt: null,
          status: { in: ["open", "in_progress"] },
        },
      }),
      prisma.contract.count({
        where: { status: "active" },
      }),
      prisma.payment.count({
        where: {
          status: "paid",
          paidAt: { gte: startOfToday },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfToday },
          role: { not: "admin" },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "paid" },
        _sum: { amount: true },
      }),
      prisma.review.count(),
      prisma.user.findMany({
        where: { role: { not: "admin" }, deletedAt: null },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          city: true,
          createdAt: true,
          employer: {
            select: { name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // ---- داده نمودار ۷ روز اخیر ----
    const days: { date: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("fa-IR", {
          month: "short",
          day: "numeric",
        }),
      });
    }

    const [usersInRange, projectsInRange, paymentsInRange] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: { gte: last7Days },
          role: { not: "admin" },
        },
        select: { createdAt: true },
      }),
      prisma.project.findMany({
        where: {
          createdAt: { gte: last7Days },
          deletedAt: null,
        },
        select: { createdAt: true },
      }),
      prisma.payment.findMany({
        where: {
          status: "paid",
          paidAt: { gte: last7Days },
        },
        select: { paidAt: true, amount: true },
      }),
    ]);

    const countByDay = (
      items: { createdAt?: Date | null; paidAt?: Date | null }[],
      field: "createdAt" | "paidAt",
    ) => {
      return days.map((day) => {
        const count = items.filter((item) => {
          const dateVal = field === "createdAt" ? item.createdAt : item.paidAt;
          if (!dateVal) return false;
          return dateVal.toISOString().slice(0, 10) === day.date;
        }).length;
        return { date: day.date, label: day.label, value: count };
      });
    };

    const revenueByDay = days.map((day) => {
      const sum = paymentsInRange
        .filter(
          (p) => p.paidAt && p.paidAt.toISOString().slice(0, 10) === day.date,
        )
        .reduce((acc, p) => acc + Number(p.amount), 0);
      return { date: day.date, label: day.label, value: sum };
    });

    return res.json({
      success: true,
      stats: {
        usersCount,
        projectsCount,
        activeProjects,
        activeContracts,
        todayPayments: todayPaymentsCount,
        newUsersToday,
        revenue: Number(revenueAgg._sum.amount || 0),
        pendingReviews,
        pendingReports: 0, // مدل Report هنوز نداریم
      },
      latestUsers,
      latestProjects,
      charts: {
        dailyRegistrations: countByDay(usersInRange, "createdAt"),
        dailyProjects: countByDay(projectsInRange, "createdAt"),
        dailyPayments: revenueByDay,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت آمار داشبورد",
    });
  }
};

export const publishProject = async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { status: "open", publishedAt: new Date() },
      select: { id: true, status: true, publishedAt: true },
    });
    return res.json({ success: true, message: "پروژه منتشر شد", project });
  } catch (error) {
    console.error("Publish Project Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در انتشار پروژه" });
  }
};

export const closeProject = async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { status: "completed", closedAt: new Date() },
      select: { id: true, status: true, closedAt: true },
    });
    return res.json({ success: true, message: "پروژه بسته شد", project });
  } catch (error) {
    console.error("Close Project Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در بستن پروژه" });
  }
};

export const toggleFeatureProject = async (req: Request, res: Response) => {
  try {
    const current = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      select: { isFeatured: true },
    });

    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { isFeatured: !current.isFeatured },
      select: { id: true, isFeatured: true },
    });

    return res.json({
      success: true,
      message: project.isFeatured
        ? "پروژه ویژه شد"
        : "پروژه از حالت ویژه خارج شد",
      project,
    });
  } catch (error) {
    console.error("Toggle Feature Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در تغییر وضعیت ویژه" });
  }
};

// Soft delete
export const deleteProjectByAdmin = async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date(), status: "cancelled" },
      select: { id: true, deletedAt: true },
    });
    return res.json({ success: true, message: "پروژه حذف شد", project });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف پروژه" });
  }
};

export const getAllProposalsForAdmin = async (req: Request, res: Response) => {
  try {
    const proposals = await prisma.proposal.findMany({
      select: {
        id: true,
        amount: true,
        deliveryDays: true,
        status: true,
        createdAt: true,
        freelancer: {
          select: { id: true, name: true, phone: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error("Get All Proposals Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در دریافت لیست پیشنهادها",
    });
  }
};

// تایید پیشنهاد → ساخت قرارداد + رد خودکار بقیه پیشنهادهای همون پروژه
export const acceptProposalForAdmin = async (req: Request, res: Response) => {
  try {
    const proposalId = Number(req.params.id);

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "فقط پیشنهادهای در انتظار قابل تایید هستند",
      });
    }

    const existingContract = await prisma.contract.findUnique({
      where: { projectId: proposal.projectId },
    });
    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: "برای این پروژه قبلاً قرارداد ثبت شده است",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      });

      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
          status: "pending",
        },
        data: { status: "rejected" },
      });

      const contract = await tx.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          employerId: proposal.project.employerId,
          freelancerId: proposal.freelancerId,
          totalAmount: proposal.amount,
          status: "active",
        },
      });

      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });

      return { updatedProposal, contract };
    });

    return res.json({
      success: true,
      message: "پیشنهاد تایید شد و قرارداد ایجاد شد",
      proposal: result.updatedProposal,
      contract: result.contract,
    });
  } catch (error) {
    console.error("Accept Proposal Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در تایید پیشنهاد" });
  }
};

// رد پیشنهاد
export const rejectProposalForAdmin = async (req: Request, res: Response) => {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "فقط پیشنهادهای در انتظار قابل رد هستند",
      });
    }

    const updated = await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "rejected" },
      select: { id: true, status: true },
    });

    return res.json({
      success: true,
      message: "پیشنهاد رد شد",
      proposal: updated,
    });
  } catch (error) {
    console.error("Reject Proposal Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در رد پیشنهاد" });
  }
};

// حذف پیشنهاد (Proposal مدل soft-delete نداره، حذف واقعیه)
export const deleteProposalForAdmin = async (req: Request, res: Response) => {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!proposal) {
      return res
        .status(404)
        .json({ success: false, message: "پیشنهاد یافت نشد" });
    }

    // Contract.proposalId → onDelete: Cascade
    // یعنی اگه پیشنهاد accepted حذف بشه، قرارداد فعالش هم پاک می‌شه
    if (proposal.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "پیشنهاد تاییدشده (دارای قرارداد) قابل حذف نیست",
      });
    }

    await prisma.proposal.delete({ where: { id: proposal.id } });

    return res.json({ success: true, message: "پیشنهاد حذف شد" });
  } catch (error) {
    console.error("Delete Proposal Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف پیشنهاد" });
  }
};

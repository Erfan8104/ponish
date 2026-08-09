import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { logAdminActivity, getAdminId } from "../utils/activityLog";

// ==============================
// لاگ فعالیت‌ها (فاز ۱۴)
// ==============================

export const getAllActivityLogsForAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      search = "",
      action,
      targetType,
      adminId,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    const where: any = {};

    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (adminId) where.adminId = Number(adminId);

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { admin: { phone: { contains: search } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          description: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          admin: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get Activity Logs Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لاگ فعالیت‌ها" });
  }
};

// ==============================
// مدیریت فایل‌ها (فاز ۱۲)
// ==============================

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

function tryDeletePhysicalFile(fileUrlOrPath: string | null | undefined) {
  if (!fileUrlOrPath) return;
  try {
    let relative = fileUrlOrPath.replace(/^\/+/, "");
    if (relative.startsWith("uploads/")) {
      relative = relative.slice("uploads/".length);
    }
    const fullPath = path.join(UPLOADS_ROOT, relative);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn("Could not delete physical file:", fileUrlOrPath, err);
  }
}

export const getAllFilesForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      type,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));

    const results: any[] = [];

    // ---- ۱. آواتارها ----
    if (!type || type === "avatar") {
      const whereUser: any = {
        avatar: { not: null },
        deletedAt: null,
      };
      if (search) {
        whereUser.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where: whereUser,
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      for (const u of users) {
        results.push({
          id: u.id,
          type: "avatar",
          fileName: u.avatar?.split("/").pop() || "avatar",
          fileUrl: u.avatar,
          fileType: null,
          fileSize: null,
          relatedId: u.id,
          relatedTitle: u.name || u.phone || `User #${u.id}`,
          relatedType: "user",
          createdAt: u.createdAt,
        });
      }
    }

    // ---- ۲. پیوست‌های پروژه ----
    if (!type || type === "attachment") {
      const whereAtt: any = {};
      if (search) {
        whereAtt.OR = [
          { fileName: { contains: search, mode: "insensitive" } },
          { project: { title: { contains: search, mode: "insensitive" } } },
        ];
      }

      const attachments = await prisma.projectAttachment.findMany({
        where: whereAtt,
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      for (const a of attachments) {
        results.push({
          id: a.id,
          type: "attachment",
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
          relatedId: a.project?.id,
          relatedTitle: a.project?.title || `Project #${a.project?.id}`,
          relatedType: "project",
          createdAt: a.createdAt,
        });
      }
    }

    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = results.length;
    const start = (pageNum - 1) * limitNum;
    const paged = results.slice(start, start + limitNum);

    return res.json({
      success: true,
      files: paged,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Files Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست فایل‌ها" });
  }
};

export const deleteFileByAdmin = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const numId = Number(id);

    if (!["avatar", "attachment"].includes(type) || isNaN(numId)) {
      return res
        .status(400)
        .json({ success: false, message: "پارامترهای نامعتبر" });
    }

    if (type === "avatar") {
      const user = await prisma.user.findUnique({
        where: { id: numId },
        select: { id: true, avatar: true, name: true, phone: true },
      });
      if (!user || !user.avatar) {
        return res
          .status(404)
          .json({ success: false, message: "آواتار یافت نشد" });
      }

      tryDeletePhysicalFile(user.avatar);

      await prisma.user.update({
        where: { id: numId },
        data: { avatar: null },
      });

      // لاگ
      const adminId = getAdminId(req);
      if (adminId) {
        await logAdminActivity({
          adminId,
          action: "file.delete",
          targetType: "avatar",
          targetId: numId,
          description: `ادمین آواتار کاربر «${user.name || user.phone}» را حذف کرد`,
          req,
        });
      }

      return res.json({ success: true, message: "آواتار حذف شد" });
    }

    // attachment
    const attachment = await prisma.projectAttachment.findUnique({
      where: { id: numId },
      include: { project: { select: { id: true, title: true } } },
    });
    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "فایل پیوست یافت نشد" });
    }

    tryDeletePhysicalFile(attachment.fileUrl);

    await prisma.projectAttachment.delete({ where: { id: numId } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "file.delete",
        targetType: "attachment",
        targetId: numId,
        description: `ادمین فایل پیوست «${attachment.fileName}» از پروژه «${attachment.project?.title || attachment.projectId}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "فایل پیوست حذف شد" });
  } catch (error) {
    console.error("Delete File Error:", error);
    return res.status(500).json({ success: false, message: "خطا در حذف فایل" });
  }
};

// ==============================
// مدیریت کاربران
// ==============================

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
      select: { id: true, name: true, phone: true, isVerified: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.verify",
        targetType: "user",
        targetId: user.id,
        description: `ادمین کاربر «${user.name || user.phone}» را تأیید کرد`,
        req,
      });
    }

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
      select: { id: true, name: true, phone: true, deletedAt: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.delete",
        targetType: "user",
        targetId: user.id,
        description: `ادمین کاربر «${user.name || user.phone}» را حذف کرد`,
        req,
      });
    }

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

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { password: hashed },
      select: { id: true, name: true, phone: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.reset_password",
        targetType: "user",
        targetId: user.id,
        description: `ادمین رمز عبور کاربر «${user.name || user.phone}» را بازنشانی کرد`,
        req,
      });
    }

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
      select: { id: true, name: true, phone: true, role: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "user.change_role",
        targetType: "user",
        targetId: user.id,
        description: `ادمین نقش کاربر «${user.name || user.phone}» را به «${role}» تغییر داد`,
        metadata: { newRole: role },
        req,
      });
    }

    return res.json({ success: true, message: "نقش کاربر تغییر یافت", user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "خطا در تغییر نقش" });
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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: updatedUser.isActive ? "user.activate" : "user.deactivate",
        targetType: "user",
        targetId: updatedUser.id,
        description: `ادمین حساب «${updatedUser.name || updatedUser.phone}» را ${updatedUser.isActive ? "فعال" : "غیرفعال"} کرد`,
        req,
      });
    }

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

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و رمز عبور الزامی هستند",
      });
    }

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

    const isSuperAdmin = adminRoles.some((r) => r.name === "SUPER_ADMIN");

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        adminRoles: adminRoles.map((r) => r.name),
        permissions: isSuperAdmin ? ["*"] : permissions,
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

// ==============================
// داشبورد
// ==============================

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

    const [
      usersCount,
      projectsCount,
      activeProjects,
      activeContracts,
      todayPaymentsCount,
      newUsersToday,
      revenueAgg,
      pendingReviews,
      pendingReports,
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
      prisma.report.count({ where: { status: "pending" } }),
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
        pendingReports,
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

// ==============================
// مدیریت پروژه‌ها
// ==============================

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

export const publishProject = async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { status: "open", publishedAt: new Date() },
      select: { id: true, title: true, status: true, publishedAt: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.publish",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را منتشر کرد`,
        req,
      });
    }

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
      select: { id: true, title: true, status: true, closedAt: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.close",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را بست`,
        req,
      });
    }

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
      select: { id: true, title: true, isFeatured: true },
    });

    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "پروژه یافت نشد" });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { isFeatured: !current.isFeatured },
      select: { id: true, title: true, isFeatured: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: project.isFeatured ? "project.feature" : "project.unfeature",
        targetType: "project",
        targetId: project.id,
        description: project.isFeatured
          ? `ادمین پروژه «${project.title || project.id}» را ویژه کرد`
          : `ادمین پروژه «${project.title || project.id}» را از حالت ویژه خارج کرد`,
        req,
      });
    }

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
      select: { id: true, title: true, deletedAt: true },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "project.delete",
        targetType: "project",
        targetId: project.id,
        description: `ادمین پروژه «${project.title || project.id}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "پروژه حذف شد", project });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف پروژه" });
  }
};

// ==============================
// مدیریت پیشنهادها
// ==============================

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.accept",
        targetType: "proposal",
        targetId: proposalId,
        description: `ادمین پیشنهاد #${proposalId} را تأیید کرد و قرارداد #${result.contract.id} ایجاد شد`,
        metadata: {
          contractId: result.contract.id,
          projectId: proposal.projectId,
        },
        req,
      });
    }

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

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.reject",
        targetType: "proposal",
        targetId: proposal.id,
        description: `ادمین پیشنهاد #${proposal.id} را رد کرد`,
        req,
      });
    }

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

    if (proposal.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "پیشنهاد تاییدشده (دارای قرارداد) قابل حذف نیست",
      });
    }

    await prisma.proposal.delete({ where: { id: proposal.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "proposal.delete",
        targetType: "proposal",
        targetId: proposal.id,
        description: `ادمین پیشنهاد #${proposal.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "پیشنهاد حذف شد" });
  } catch (error) {
    console.error("Delete Proposal Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف پیشنهاد" });
  }
};

// ==============================
// مدیریت قراردادها
// ==============================

export const getAllContractsForAdmin = async (req: Request, res: Response) => {
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

    const where: any = {};

    if (search) {
      where.OR = [
        { employer: { name: { contains: search, mode: "insensitive" } } },
        { employer: { phone: { contains: search } } },
        { freelancer: { name: { contains: search, mode: "insensitive" } } },
        { freelancer: { phone: { contains: search } } },
        { project: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "amount") orderBy = { totalAmount: "desc" };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          startedAt: true,
          completedAt: true,
          cancelledAt: true,
          project: { select: { id: true, title: true } },
          employer: { select: { id: true, name: true, phone: true } },
          freelancer: { select: { id: true, name: true, phone: true } },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.contract.count({ where }),
    ]);

    return res.json({
      success: true,
      contracts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Contracts Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست قراردادها" });
  }
};

export const getContractDetailForAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const contractId = Number(req.params.id);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        project: {
          select: { id: true, title: true, status: true, description: true },
        },
        employer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        freelancer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        milestones: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "desc" } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
            reviewed: { select: { id: true, name: true } },
          },
        },
        amendments: { orderBy: { createdAt: "desc" } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            content: true,
            type: true,
            fileUrl: true,
            createdAt: true,
            senderId: true,
            receiverId: true,
          },
        },
      },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    return res.json({ success: true, contract });
  } catch (error) {
    console.error("Get Contract Detail Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت جزئیات قرارداد" });
  }
};

export const cancelContractByAdmin = async (req: Request, res: Response) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد فعال قابل لغو است",
      });
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: "cancelled", cancelledAt: new Date() },
        select: { id: true, status: true, cancelledAt: true },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: { status: "cancelled", closedAt: new Date() },
      }),
    ]);

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.cancel",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین قرارداد #${contract.id} را لغو کرد`,
        req,
      });
    }

    return res.json({
      success: true,
      message: "قرارداد لغو شد",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Cancel Contract Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در لغو قرارداد" });
  }
};

export const completeContractByAdmin = async (req: Request, res: Response) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد فعال قابل تکمیل است",
      });
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: "completed", completedAt: new Date() },
        select: { id: true, status: true, completedAt: true },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: { status: "completed", closedAt: new Date() },
      }),
    ]);

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.complete",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین قرارداد #${contract.id} را تکمیل کرد`,
        req,
      });
    }

    return res.json({
      success: true,
      message: "قرارداد تکمیل شد",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Complete Contract Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در تکمیل قرارداد" });
  }
};

export const resolveContractDisputeByAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const { resolution } = req.body as {
      resolution: "active" | "completed" | "cancelled";
    };
    const allowedResolutions = ["active", "completed", "cancelled"];

    if (!allowedResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: "نتیجه رفع اختلاف نامعتبر است",
      });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    if (contract.status !== "disputed") {
      return res.status(400).json({
        success: false,
        message: "فقط قرارداد در وضعیت اختلاف قابل رفع است",
      });
    }

    const contractData: any = { status: resolution };
    const projectData: any = {};

    if (resolution === "completed") {
      contractData.completedAt = new Date();
      projectData.status = "completed";
      projectData.closedAt = new Date();
    } else if (resolution === "cancelled") {
      contractData.cancelledAt = new Date();
      projectData.status = "cancelled";
      projectData.closedAt = new Date();
    } else {
      projectData.status = "in_progress";
    }

    const [updatedContract] = await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: contractData,
        select: {
          id: true,
          status: true,
          completedAt: true,
          cancelledAt: true,
        },
      }),
      prisma.project.update({
        where: { id: contract.projectId },
        data: projectData,
      }),
    ]);

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "contract.resolve_dispute",
        targetType: "contract",
        targetId: contract.id,
        description: `ادمین اختلاف قرارداد #${contract.id} را با نتیجه «${resolution}» رفع کرد`,
        metadata: { resolution },
        req,
      });
    }

    return res.json({
      success: true,
      message: "اختلاف قرارداد رفع شد",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Resolve Contract Dispute Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در رفع اختلاف قرارداد" });
  }
};

// ==============================
// مدیریت پرداخت‌ها
// ==============================

export const getAllPaymentsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      status,
      sortBy = "newest",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};
    if (status) where.status = status;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "amount") orderBy = { amount: "desc" };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          amount: true,
          gateway: true,
          trackingCode: true,
          status: true,
          paidAt: true,
          createdAt: true,
          contractId: true,
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
              employer: { select: { id: true, name: true, phone: true } },
              freelancer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
    ]);

    return res.json({
      success: true,
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست پرداخت‌ها" });
  }
};

// ==============================
// مدیریت دسته‌بندی‌ها
// ==============================

async function getDescendantCategoryIds(categoryId: number): Promise<number[]> {
  const directChildren = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  let result: number[] = directChildren.map((c) => c.id);

  for (const child of directChildren) {
    const nested = await getDescendantCategoryIds(child.id);
    result = result.concat(nested);
  }

  return result;
}

export const getAllCategoriesForAdmin = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { children: true, projects: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ success: true, categories });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست دسته‌بندی‌ها" });
  }
};

export const createCategoryByAdmin = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parentId } = req.body as {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: number | null;
    };

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "نام و اسلاگ الزامی هستند",
      });
    }

    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: Number(parentId) },
        select: { id: true },
      });
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی والد یافت نشد",
        });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.create",
        targetType: "category",
        targetId: category.id,
        description: `ادمین دسته‌بندی «${category.name}» را ایجاد کرد`,
        req,
      });
    }

    return res.json({
      success: true,
      message: "دسته‌بندی ایجاد شد",
      category,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "این اسلاگ قبلاً استفاده شده است",
      });
    }
    console.error("Create Category Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ایجاد دسته‌بندی" });
  }
};

export const updateCategoryByAdmin = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, slug, description, parentId } = req.body as {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: number | null;
    };

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "دسته‌بندی یافت نشد" });
    }

    if (parentId) {
      const newParentId = Number(parentId);

      if (newParentId === categoryId) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی نمی‌تواند والد خودش باشد",
        });
      }

      const descendantIds = await getDescendantCategoryIds(categoryId);
      if (descendantIds.includes(newParentId)) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی نمی‌تواند زیرمجموعه‌ی خودش قرار بگیرد",
        });
      }

      const parentExists = await prisma.category.findUnique({
        where: { id: newParentId },
        select: { id: true },
      });
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: "دسته‌بندی والد یافت نشد",
        });
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        parentId: parentId ? Number(parentId) : null,
      },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.update",
        targetType: "category",
        targetId: category.id,
        description: `ادمین دسته‌بندی «${category.name}» را ویرایش کرد`,
        req,
      });
    }

    return res.json({
      success: true,
      message: "دسته‌بندی ویرایش شد",
      category,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "این اسلاگ قبلاً استفاده شده است",
      });
    }
    console.error("Update Category Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ویرایش دسته‌بندی" });
  }
};

export const deleteCategoryByAdmin = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { children: true } } },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "دسته‌بندی یافت نشد" });
    }

    if (existing._count.children > 0) {
      return res.status(400).json({
        success: false,
        message:
          "این دسته‌بندی دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا جابه‌جا کنید",
      });
    }

    await prisma.category.delete({ where: { id: categoryId } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "category.delete",
        targetType: "category",
        targetId: categoryId,
        description: `ادمین دسته‌بندی «${existing.name}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "دسته‌بندی حذف شد" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف دسته‌بندی" });
  }
};

// ==============================
// مدیریت مهارت‌ها
// ==============================

export const getAllSkillsForAdmin = async (req: Request, res: Response) => {
  try {
    const { search = "" } = req.query as Record<string, string>;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        _count: { select: { freelancers: true, projects: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ success: true, skills });
  } catch (error) {
    console.error("Get All Skills Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست مهارت‌ها" });
  }
};

export const createSkillByAdmin = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body as { name?: string; slug?: string };

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "نام و اسلاگ الزامی هستند",
      });
    }

    const skill = await prisma.skill.create({ data: { name, slug } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.create",
        targetType: "skill",
        targetId: skill.id,
        description: `ادمین مهارت «${skill.name}» را ایجاد کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "مهارت ایجاد شد", skill });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "این اسلاگ قبلاً استفاده شده است",
      });
    }
    console.error("Create Skill Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ایجاد مهارت" });
  }
};

export const updateSkillByAdmin = async (req: Request, res: Response) => {
  try {
    const skillId = Number(req.params.id);
    const { name, slug } = req.body as { name?: string; slug?: string };

    const existing = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "مهارت یافت نشد" });
    }

    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
      },
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.update",
        targetType: "skill",
        targetId: skill.id,
        description: `ادمین مهارت «${skill.name}» را ویرایش کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "مهارت ویرایش شد", skill });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "این اسلاگ قبلاً استفاده شده است",
      });
    }
    console.error("Update Skill Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ویرایش مهارت" });
  }
};

export const deleteSkillByAdmin = async (req: Request, res: Response) => {
  try {
    const skillId = Number(req.params.id);

    const existing = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "مهارت یافت نشد" });
    }

    await prisma.skill.delete({ where: { id: skillId } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.delete",
        targetType: "skill",
        targetId: skillId,
        description: `ادمین مهارت «${existing.name}» را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "مهارت حذف شد" });
  } catch (error) {
    console.error("Delete Skill Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف مهارت" });
  }
};

export const mergeSkillsByAdmin = async (req: Request, res: Response) => {
  try {
    const { sourceSkillIds, targetSkillId } = req.body as {
      sourceSkillIds?: number[];
      targetSkillId?: number;
    };

    if (
      !Array.isArray(sourceSkillIds) ||
      sourceSkillIds.length === 0 ||
      !targetSkillId
    ) {
      return res.status(400).json({
        success: false,
        message: "لیست مهارت‌های مبدأ و مهارت مقصد الزامی هستند",
      });
    }

    const cleanSourceIds = sourceSkillIds
      .map((id) => Number(id))
      .filter((id) => id !== Number(targetSkillId));

    if (cleanSourceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "مهارت مقصد نمی‌تواند در لیست مبدأها باشد",
      });
    }

    const allIds = [...cleanSourceIds, Number(targetSkillId)];
    const foundSkills = await prisma.skill.findMany({
      where: { id: { in: allIds } },
      select: { id: true, name: true },
    });

    if (foundSkills.length !== allIds.length) {
      return res.status(400).json({
        success: false,
        message: "یک یا چند مهارت انتخاب‌شده یافت نشد",
      });
    }

    const targetSkill = foundSkills.find((s) => s.id === Number(targetSkillId));

    await prisma.$transaction(async (tx) => {
      for (const sourceId of cleanSourceIds) {
        const freelancerLinks = await tx.freelancerSkill.findMany({
          where: { skillId: sourceId },
        });

        for (const link of freelancerLinks) {
          const alreadyHasTarget = await tx.freelancerSkill.findUnique({
            where: {
              freelancerProfileId_skillId: {
                freelancerProfileId: link.freelancerProfileId,
                skillId: Number(targetSkillId),
              },
            },
          });

          if (alreadyHasTarget) {
            await tx.freelancerSkill.delete({ where: { id: link.id } });
          } else {
            await tx.freelancerSkill.update({
              where: { id: link.id },
              data: { skillId: Number(targetSkillId) },
            });
          }
        }

        const projectLinks = await tx.projectSkill.findMany({
          where: { skillId: sourceId },
        });

        for (const link of projectLinks) {
          const alreadyHasTarget = await tx.projectSkill.findUnique({
            where: {
              projectId_skillId: {
                projectId: link.projectId,
                skillId: Number(targetSkillId),
              },
            },
          });

          if (alreadyHasTarget) {
            await tx.projectSkill.delete({ where: { id: link.id } });
          } else {
            await tx.projectSkill.update({
              where: { id: link.id },
              data: { skillId: Number(targetSkillId) },
            });
          }
        }

        await tx.skill.delete({ where: { id: sourceId } });
      }
    });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "skill.merge",
        targetType: "skill",
        targetId: Number(targetSkillId),
        description: `ادمین ${cleanSourceIds.length} مهارت را در «${targetSkill?.name || targetSkillId}» ادغام کرد`,
        metadata: { sourceSkillIds: cleanSourceIds, targetSkillId },
        req,
      });
    }

    return res.json({
      success: true,
      message: "مهارت‌ها با موفقیت ادغام شدند",
    });
  } catch (error) {
    console.error("Merge Skills Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ادغام مهارت‌ها" });
  }
};

// ==============================
// مدیریت پیام‌ها
// ==============================

export const getAllConversationsForAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        contractId: true,
        senderId: true,
        receiverId: true,
        content: true,
        type: true,
        createdAt: true,
        sender: { select: { id: true, name: true, phone: true } },
        receiver: { select: { id: true, name: true, phone: true } },
        contract: {
          select: {
            id: true,
            project: { select: { id: true, title: true } },
          },
        },
      },
    });

    const seen = new Map<string, any>();

    for (const m of messages) {
      const key = m.contractId
        ? `contract-${m.contractId}`
        : `direct-${Math.min(m.senderId, m.receiverId)}-${Math.max(m.senderId, m.receiverId)}`;

      if (!seen.has(key)) {
        seen.set(key, {
          key,
          contractId: m.contractId,
          projectTitle: m.contract?.project?.title || null,
          userA: m.sender,
          userB: m.receiver,
          lastMessagePreview:
            m.type === "text"
              ? m.content
              : m.type === "file"
                ? "📎 فایل پیوست"
                : "پیام سیستمی",
          lastMessageAt: m.createdAt,
        });
      }
    }

    const conversations = Array.from(seen.values());

    return res.json({ success: true, conversations });
  } catch (error) {
    console.error("Get All Conversations Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست مکالمات" });
  }
};

export const getConversationThreadForAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const { contractId, userAId, userBId } = req.query as Record<
      string,
      string
    >;

    let where: any;

    if (contractId) {
      where = { contractId: Number(contractId) };
    } else if (userAId && userBId) {
      where = {
        contractId: null,
        OR: [
          { senderId: Number(userAId), receiverId: Number(userBId) },
          { senderId: Number(userBId), receiverId: Number(userAId) },
        ],
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "شناسه مکالمه نامعتبر است",
      });
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        type: true,
        fileUrl: true,
        readAt: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
        sender: { select: { id: true, name: true, phone: true } },
        receiver: { select: { id: true, name: true, phone: true } },
      },
    });

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("Get Conversation Thread Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت مکالمه" });
  }
};

// ==============================
// مدیریت نظرات
// ==============================

export const getAllReviewsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      rating,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { reviewer: { name: { contains: search, mode: "insensitive" } } },
        { reviewed: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (rating) {
      where.rating = Number(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          target: true,
          createdAt: true,
          reviewer: { select: { id: true, name: true, phone: true } },
          reviewed: { select: { id: true, name: true, phone: true } },
          contract: {
            select: {
              id: true,
              project: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Reviews Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست نظرات" });
  }
};

export const deleteReviewByAdmin = async (req: Request, res: Response) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "نظر یافت نشد" });
    }

    await prisma.review.delete({ where: { id: review.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "review.delete",
        targetType: "review",
        targetId: review.id,
        description: `ادمین نظر #${review.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "نظر حذف شد" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: "خطا در حذف نظر" });
  }
};

// ==============================
// مدیریت گزارش‌ها (فاز ۱۳)
// ==============================

export const getAllReportsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      status,
      targetType,
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);

    const where: any = {};

    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { reporter: { name: { contains: search, mode: "insensitive" } } },
        { reporter: { phone: { contains: search } } },
      ];
    }

    const [reports, total, statusCounts] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          description: true,
          status: true,
          adminNote: true,
          resolvedAt: true,
          createdAt: true,
          reporter: {
            select: { id: true, name: true, phone: true },
          },
          resolver: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const stats = {
      pending: 0,
      reviewing: 0,
      resolved: 0,
      rejected: 0,
      dismissed: 0,
    };
    statusCounts.forEach((item) => {
      stats[item.status as keyof typeof stats] = item._count.status;
    });

    return res.json({
      success: true,
      reports,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get All Reports Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست گزارش‌ها" });
  }
};

export const getReportDetailForAdmin = async (req: Request, res: Response) => {
  try {
    const reportId = Number(req.params.id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        resolver: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    let targetInfo: any = null;

    if (report.targetType === "user") {
      targetInfo = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });
    } else if (report.targetType === "project") {
      targetInfo = await prisma.project.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          title: true,
          status: true,
          province: true,
          employer: { select: { id: true, name: true, phone: true } },
        },
      });
    } else if (report.targetType === "message") {
      targetInfo = await prisma.message.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          type: true,
          createdAt: true,
          sender: { select: { id: true, name: true, phone: true } },
          receiver: { select: { id: true, name: true, phone: true } },
        },
      });
    } else if (report.targetType === "review") {
      targetInfo = await prisma.review.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          rating: true,
          comment: true,
          reviewer: { select: { id: true, name: true } },
          reviewed: { select: { id: true, name: true } },
        },
      });
    } else if (report.targetType === "proposal") {
      targetInfo = await prisma.proposal.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          amount: true,
          status: true,
          freelancer: { select: { id: true, name: true, phone: true } },
          project: { select: { id: true, title: true } },
        },
      });
    }

    return res.json({
      success: true,
      report: { ...report, targetInfo },
    });
  } catch (error) {
    console.error("Get Report Detail Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت جزئیات گزارش" });
  }
};

export const updateReportStatusByAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    const reportId = Number(req.params.id);
    const { status, adminNote } = req.body as {
      status?: string;
      adminNote?: string;
    };

    const allowedStatuses = [
      "pending",
      "reviewing",
      "resolved",
      "rejected",
      "dismissed",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "وضعیت نامعتبر است" });
    }

    const existing = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    const adminId = getAdminId(req);

    const data: any = {};
    if (status) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote;

    if (
      status &&
      ["resolved", "rejected", "dismissed"].includes(status) &&
      existing.status !== status
    ) {
      data.resolvedBy = adminId;
      data.resolvedAt = new Date();
    }

    if (status === "pending") {
      data.resolvedBy = null;
      data.resolvedAt = null;
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data,
      select: {
        id: true,
        status: true,
        adminNote: true,
        resolvedAt: true,
        resolvedBy: true,
      },
    });

    // لاگ
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "report.update_status",
        targetType: "report",
        targetId: reportId,
        description: `ادمین وضعیت گزارش #${reportId} را به «${status || existing.status}» تغییر داد`,
        metadata: { newStatus: status, adminNote },
        req,
      });
    }

    return res.json({
      success: true,
      message: "وضعیت گزارش به‌روزرسانی شد",
      report,
    });
  } catch (error) {
    console.error("Update Report Status Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در به‌روزرسانی گزارش" });
  }
};

export const deleteReportByAdmin = async (req: Request, res: Response) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "گزارش یافت نشد" });
    }

    await prisma.report.delete({ where: { id: report.id } });

    // لاگ
    const adminId = getAdminId(req);
    if (adminId) {
      await logAdminActivity({
        adminId,
        action: "report.delete",
        targetType: "report",
        targetId: report.id,
        description: `ادمین گزارش #${report.id} را حذف کرد`,
        req,
      });
    }

    return res.json({ success: true, message: "گزارش حذف شد" });
  } catch (error) {
    console.error("Delete Report Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در حذف گزارش" });
  }
};

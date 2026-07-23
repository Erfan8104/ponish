import { Response } from "express";
import { prisma } from "../lib/prisma"; // ⚡ مسیر فایل کانفیگ پریسما شما
import { AuthRequest } from "../middleware/auth.middleware";

export const contractController = {
  // ۱. ثبت پیشنهاد الحاقیه توسط کارفرما (پشتیبانی از مساحت یا طول کریدور)
  async createAmendment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { contractId } = req.params;
      const {
        proposed_area,
        proposed_length, // 🌟 دریافت طول پیشنهادی برای پروژه‌های کریدوری
        proposed_amount,
        proposed_delivery_time,
        notes,
      } = req.body;
      const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      // پیدا کردن قرارداد به همراه اطلاعات پروژه متصل به آن با پریسما
      const contract = await prisma.contract.findUnique({
        where: { id: Number(contractId) },
        include: { project: true },
      });

      if (!contract) {
        return res
          .status(404)
          .json({ success: false, message: "قرارداد مورد نظر یافت نشد." });
      }

      // بررسی سطح دسترسی: کارفرمای پروژه باید با کاربر لاگین شده برابر باشد
      if (contract.employerId !== loggedInUserId) {
        return res.status(403).json({
          success: false,
          message: "شما دسترسی لازم برای تغییر این قرارداد را ندارید.",
        });
      }

      // بررسی عدم وجود الحاقیه فعال یا منتظر تایید (pending) برای این قرارداد
      const existingPending = await prisma.contractAmendment.findFirst({
        where: {
          contractId: Number(contractId),
          status: "pending",
        },
      });

      if (existingPending) {
        return res.status(400).json({
          success: false,
          message: "یک الحاقیه منتظر تایید برای این قرارداد وجود دارد.",
        });
      }

      // ایجاد الحاقیه جدید در دیتابیس (پشتیبانی از مساحت و طول)
      const amendment = await prisma.contractAmendment.create({
        data: {
          contractId: Number(contractId),
          proposed_area: proposed_area ? Number(proposed_area) : null,
          proposed_length: proposed_length ? Number(proposed_length) : null, // 🌟 ذخیره طول اگر ارسال شده باشد
          proposed_amount: Number(proposed_amount),
          proposed_delivery_time: proposed_delivery_time
            ? Number(proposed_delivery_time)
            : null,
          notes: notes || null,
          status: "pending",
        },
      });

      return res.status(201).json({
        success: true,
        message: "پیشنهاد الحاقیه با موفقیت ثبت و برای فریلنسر ارسال شد.",
        amendment,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "خطا در سرور هنگام ثبت الحاقیه" });
    }
  },

  // ۲. پاسخ فریلنسر (تایید یا رد الحاقیه)
  async respondToAmendment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { amendmentId } = req.params;
      const { status } = req.body; // 'accepted' یا 'rejected'
      const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "وضعیت ارسالی نامعتبر است." });
      }

      // پیدا کردن الحاقیه به همراه قرارداد و پروژه مربوطه
      const amendment = await prisma.contractAmendment.findUnique({
        where: { id: Number(amendmentId) },
        include: {
          contract: {
            include: { project: true },
          },
        },
      });

      if (!amendment) {
        return res
          .status(404)
          .json({ success: false, message: "اصلاحیه مورد نظر یافت نشد." });
      }

      // بررسی سطح دسترسی: فقط فریلنسرِ قرارداد می‌تواند تایید یا رد کند
      if (amendment.contract.freelancerId !== loggedInUserId) {
        return res.status(403).json({
          success: false,
          message: "تنها فریلنسر پروژه امکان تایید یا رد این اصلاحیه را دارد.",
        });
      }

      // استفاده از Transaction برای ثبت همزمان تغییرات در دیتابیس
      const updatedAmendment = await prisma.$transaction(async (tx) => {
        // ۱. آپدیت وضعیت الحاقیه
        const updated = await tx.contractAmendment.update({
          where: { id: Number(amendmentId) },
          data: { status: status as "accepted" | "rejected" },
        });

        // ۲. اگر فریلنسر تایید کرد، مقادیر جدید روی پروژه و قرارداد اصلی می‌نشینند
        if (status === "accepted") {
          // آپدیت totalAmount قرارداد
          await tx.contract.update({
            where: {
              id: amendment.contractId,
            },
            data: {
              totalAmount: amendment.proposed_amount,
              status: "completed",
              completedAt: new Date(),
            },
          });

          // آپدیت مقادیر پروژه بر اساس اینکه مساحتی است یا کریدوری (طولی)
          // آپدیت مقادیر پروژه بر اساس اینکه مساحتی است یا کریدوری (طولی)
          await tx.project.update({
            where: { id: amendment.contract.projectId },
            data: {
              status: "completed",
              // اگر مساحت در الحاقیه ثبت شده بود، روی پروژه بنشیند
              ...((amendment as any).proposed_area !== null && {
                calculatedArea: (amendment as any).proposed_area,
              }),
              // اگر طول مسیر کریدور در الحاقیه ثبت شده بود، روی پروژه بنشیند
              ...((amendment as any).proposed_length !== null && {
                corridorLength: (amendment as any).proposed_length,
              }),
              // 🌟 رفع خطا با استفاده از کست کردن به any برای فیلد جدید
              ...((amendment as any).proposed_delivery_time !== null && {
                deliveryTime: String((amendment as any).proposed_delivery_time),
              }),
            },
          });
        }

        return updated;
      });

      return res.json({
        success: true,
        message:
          status === "accepted"
            ? "اصلاحیه تایید، قرارداد بروزرسانی و پروژه خاتمه یافت (Completed)."
            : "اصلاحیه توسط شما رد شد.",
        amendment: updatedAmendment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "خطا در سرور هنگام ثبت پاسخ الحاقیه",
      });
    }
  },

  // ۳. دریافت لیست اصلاحیه‌های یک قرارداد خاص
  async getAmendments(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { contractId } = req.params;
      const loggedInUserId = req.user?.userId;

      if (!loggedInUserId) {
        return res
          .status(401)
          .json({ success: false, message: "کاربر احراز هویت نشده است." });
      }

      // بررسی اینکه آیا کاربر لاگین شده اصلاً کارفرما یا فریلنسرِ این قرارداد هست یا خیر
      const contract = await prisma.contract.findUnique({
        where: { id: Number(contractId) },
      });

      if (!contract) {
        return res
          .status(404)
          .json({ success: false, message: "قرارداد مورد نظر یافت نشد." });
      }

      if (
        contract.employerId !== loggedInUserId &&
        contract.freelancerId !== loggedInUserId
      ) {
        return res.status(403).json({
          success: false,
          message: "شما دسترسی لازم برای مشاهده اطلاعات این قرارداد را ندارید.",
        });
      }

      // دریافت تمام اصلاحیه‌ها به ترتیب جدیدترین
      const amendments = await prisma.contractAmendment.findMany({
        where: { contractId: Number(contractId) },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        success: true,
        amendments,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "خطا در سرور هنگام دریافت اصلاحیه‌ها",
      });
    }
  },
};

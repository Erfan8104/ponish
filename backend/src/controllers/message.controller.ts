import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * دریافت لیست پیام‌های یک قرارداد
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const contractId = Number(req.params.contractId);
    const userId = Number(req.user!.userId);

    // ۱. بررسی دسترسی: کاربر حتماً باید یکی از طرفین قرارداد باشد
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        OR: [{ employerId: userId }, { freelancerId: userId }],
      },
    });

    if (!contract) {
      return res.status(403).json({
        success: false,
        message: "دسترسی غیرمجاز: شما عضو این قرارداد نیستید",
      });
    }

    // ۲. دریافت پیام‌ها به همراه اطلاعات فرستنده
    const messages = await prisma.message.findMany({
      where: { contractId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت پیام‌ها" });
  }
};

/**
 * ارسال پیام جدید در محیط قرارداد
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const contractId = Number(req.params.contractId);
    const senderId = Number(req.user!.userId);
    const { content, type } = req.body;

    // ۱. پیدا کردن قرارداد جهت احراز وجود آن و تشخیص طرفین
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { employerId: true, freelancerId: true },
    });

    if (!contract) {
      return res
        .status(404)
        .json({ success: false, message: "قرارداد یافت نشد" });
    }

    // ۲. تشخیص هوشمندانه گیرنده
    const receiverId =
      senderId === contract.employerId
        ? contract.freelancerId
        : contract.employerId;

    // ۳. ثبت پیام در دیتابیس (استفاده از شناسه مستقیم به جای connect)
    const newMessage = await prisma.message.create({
      data: {
        contractId,
        content,
        type: type || "text",
        senderId,
        receiverId,
      } as any, // 👈 برای رد کردن موقت خطاهای سخت‌گیرانه تایپ‌اسکریپت در این بخش
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در ارسال پیام" });
  }
};

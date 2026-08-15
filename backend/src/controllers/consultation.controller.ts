import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createNotification } from "../utils/notification";

/**
 * =========================
 * Create Consultation Request (Public)
 * =========================
 * ورودی از قبل توسط validate(createConsultationSchema) پاک‌سازی و تایید شده است.
 */
export const createConsultation = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, projectType, description, contactTime } =
      req.body as {
        name: string;
        phone: string;
        email?: string;
        projectType: "ground" | "aerial" | "gis" | "unknown";
        description: string;
        contactTime?: "morning" | "noon" | "evening" | "";
      };

    const consultation = await prisma.consultationRequest.create({
      data: {
        name,
        phone,
        email: email ? email : null,
        projectType,
        description,
        contactTime: contactTime ? contactTime : null,
      },
    });

    // اعلان برای ادمین‌ها — اطلاعات حساس (شماره تماس کامل و...) در متن نمایشی قرار نمی‌گیرد
    await createNotification({
      type: "system",
      title: "درخواست مشاوره جدید",
      message: `درخواست مشاوره جدید از طرف «${consultation.name}» ثبت شد`,
      link: `/admin/consultations`,
      metadata: { consultationId: consultation.id },
    });

    return res.status(201).json({
      success: true,
      message: "درخواست مشاوره با موفقیت ثبت شد",
      data: {
        id: consultation.id,
      },
    });
  } catch (error) {
    console.error("createConsultation error:", error);
    return res.status(500).json({
      success: false,
      message: "خطا در ثبت درخواست مشاوره. لطفا دوباره تلاش کنید.",
    });
  }
};

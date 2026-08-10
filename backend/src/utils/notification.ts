import { prisma } from "../lib/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata || undefined,
      },
    });
  } catch (err) {
    // اعلان نباید باعث شکست اکشن اصلی شود
    console.error("Failed to create notification:", err);
  }
}

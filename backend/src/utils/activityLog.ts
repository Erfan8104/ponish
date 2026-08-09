import { Request } from "express";
import { prisma } from "../lib/prisma";

interface LogParams {
  adminId: number;
  action: string;
  targetType?: string;
  targetId?: number;
  description: string;
  metadata?: any;
  req?: Request;
}

export async function logAdminActivity(params: LogParams) {
  try {
    const ip =
      (params.req?.headers["x-forwarded-for"] as string)
        ?.split(",")[0]
        ?.trim() ||
      params.req?.socket?.remoteAddress ||
      null;

    const userAgent = params.req?.headers["user-agent"] || null;

    await prisma.activityLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        description: params.description,
        metadata: params.metadata || undefined,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });
  } catch (err) {
    // لاگ نباید باعث شکست اکشن اصلی شود
    console.error("Failed to write activity log:", err);
  }
}

/** گرفتن adminId از request */
export function getAdminId(req: Request): number | null {
  const user = (req as any).user;
  return user?.userId || user?.id || null;
}

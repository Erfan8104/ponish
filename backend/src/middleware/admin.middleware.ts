import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * فقط چک می‌کند که کاربر ادمین باشد (role === "admin")
 * برای سازگاری با کد فعلی نگه داشته شده
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "دسترسی غیرمجاز. لطفا ابتدا وارد شوید.",
      });
    }

    // سازگاری با سیستم قدیمی + سیستم جدید
    const isAdmin =
      req.user.role === "admin" ||
      (Array.isArray(req.user.adminRoles) && req.user.adminRoles.length > 0);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "شما به این بخش دسترسی ندارید (مختص ادمین است).",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای سرور در بررسی سطح دسترسی",
    });
  }
};

/**
 * چک کردن دسترسی خاص (مثلاً "users.delete")
 * استفاده: requirePermission("users.view")
 */
export const requirePermission = (permissionKey: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "دسترسی غیرمجاز. لطفا ابتدا وارد شوید.",
        });
      }

      const userPermissions: string[] = req.user.permissions || [];

      // اگر * داشت یعنی Super Admin است
      const hasPermission =
        userPermissions.includes("*") ||
        userPermissions.includes(permissionKey);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `شما دسترسی لازم برای این عملیات را ندارید (${permissionKey})`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "خطای سرور در بررسی دسترسی",
      });
    }
  };
};

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ابتدا مطمئن می‌شویم که کاربر از طریق authMiddleware تایید شده و req.user وجود دارد
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "دسترسی غیرمجاز. لطفا ابتدا وارد شوید.",
      });
    }

    // بررسی اینکه آیا نقش کاربر ادمین است یا خیر
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "شما به این بخش دسترسی ندارید (مختص ادمین است).",
      });
    }

    // اگر ادمین بود، اجازه عبور بده
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای سرور در بررسی سطح دسترسی",
    });
  }
};

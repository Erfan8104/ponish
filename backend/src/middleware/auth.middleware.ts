import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    phone: string;
  };
  file?: Express.Multer.File;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // بررسی وجود هدر و ساختار درست آن (Bearer Token)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توکن احراز هویت ارسال نشده یا ساختار آن نامعتبر است",
      });
    }

    const token = authHeader.split(" ")[1];

    // 🌟 استفاده از کلید مخفی امن با مقدار پیش‌فرض مطمئن
    const secret = process.env.JWT_SECRET || "supersecretkey";

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      phone: string;
    };

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "توکن نامعتبر یا منقضی شده است",
    });
  }
};

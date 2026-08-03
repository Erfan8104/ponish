import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    phone: string;
    role: string; // 🌟 این خط اضافه شد
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth Error: No token provided or invalid format");
      return res.status(401).json({
        success: false,
        message: "توکن احراز هویت ارسال نشده یا ساختار آن نامعتبر است",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "supersecretkey";

    // بررسی دقیق خطا در تایید توکن

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      phone: string;
      role: string; // 🌟 این خط اضافه شد
    };
    req.user = decoded;
    next();
  } catch (error: any) {
    // 🌟 چاپ دقیق دلیل رد شدن توکن در ترمینال
    console.error("JWT Verification Error Message:", error.message);

    return res.status(401).json({
      success: false,
      message: "توکن نامعتبر یا منقضی شده است",
    });
  }
};

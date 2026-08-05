import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    phone: string;
    role: string;
    adminRoles?: string[]; // 🌟 نقش‌های ادمین (مثل SUPER_ADMIN)
    permissions?: string[]; // 🌟 لیست دسترسی‌ها یا ["*"]
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

    const decoded = jwt.verify(token, secret) as {
      userId: number;
      phone: string;
      role: string;
      adminRoles?: string[];
      permissions?: string[];
    };

    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role,
      adminRoles: decoded.adminRoles || [],
      permissions: decoded.permissions || [],
    };

    next();
  } catch (error: any) {
    console.error("JWT Verification Error Message:", error.message);

    return res.status(401).json({
      success: false,
      message: "توکن نامعتبر یا منقضی شده است",
    });
  }
};

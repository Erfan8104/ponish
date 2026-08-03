import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و رمز عبور الزامی هستند",
      });
    }

    // پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "اطلاعات ورود نامعتبر است یا دسترسی ادمین ندارید",
      });
    }

    // بررسی رمز عبور
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور برای این حساب تنظیم نشده است",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور اشتباه است",
      });
    }

    // تولید توکن JWT حاوی نقش ادمین
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role, // 👈 اینجا نقش ادمین داخل توکن قرار می‌گیرد
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای سرور در ورود ادمین",
    });
  }
};

export const getAllUsersForAdmin = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        profileCompleted: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // جدیدترین کاربران در ابتدا
      },
    });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "خطا در دریافت لیست کاربران" });
  }
};

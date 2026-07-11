import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * ارسال رمز یکبار مصرف (OTP)
 */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن الزامی است",
      });
    }

    // تولید کد ۶ رقمی فرضی (در آینده با پنل پیامکی جایگزین شود)
    const otp = "123456";

    await prisma.oTP.create({
      data: {
        phone,
        code: otp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // اعتبار ۲ دقیقه
      },
    });

    return res.json({
      success: true,
      message: "کد تایید ارسال شد",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

/**
 * تایید رمز یکبار مصرف و ورود/ثبت‌نام کاربر
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: "شماره تلفن و کد تایید الزامی هستند",
      });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: { phone, code },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "کد تایید نامعتبر است",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "کد تایید منقضی شده است",
      });
    }

    // بررسی وجود کاربر یا ایجاد کاربر جدید
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "employer", // نقش پیش‌فرض مطابق با استور فرانت
          profileCompleted: false,
        },
      });
      isNewUser = true;
    }

    // تولید توکن JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" },
    );

    // حذف کدهای OTP مصرف شده برای این شماره
    await prisma.oTP.deleteMany({
      where: { phone },
    });

    // 🌟 خروجی منطبق با ساختار متد setToken در استور فرانت‌اند (auth.store.ts)
    return res.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || "",
        email: user.email || "",
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای داخلی سرور",
    });
  }
};

/**
 * دریافت اطلاعات کاربر لاگین شده
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        employerProfile: true,
        freelancerProfile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

/**
 * ورود با ایمیل/شماره همراه و رمز عبور
 */
export const loginWithPassword = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "ایمیل/شماره همراه و رمز عبور الزامی هستند",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const isPhone = /^09\d{9}$/.test(normalizedIdentifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isPhone ? [{ phone: normalizedIdentifier }] : []),
          ...(isEmail ? [{ email: normalizedIdentifier }] : []),
          { phone: normalizedIdentifier },
          { email: normalizedIdentifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "کاربری با این اطلاعات یافت نشد",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "برای این حساب هنوز رمز عبور تنظیم نشده است. لطفاً با شماره همراه وارد شوید",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ایمیل/شماره همراه یا رمز عبور اشتباه است",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      isNewUser: false,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || "",
        email: user.email || "",
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Password Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای داخلی سرور",
    });
  }
};

/**
 * بررسی روش ورود (بر اساس ایمیل یا شماره همراه)
 */
export const checkLoginMethod = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res
        .status(400)
        .json({ success: false, message: "ورودی الزامی است" });
    }

    const normalizedIdentifier = String(identifier).trim();
    const isPhone = /^09\d{9}$/.test(normalizedIdentifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isPhone ? [{ phone: normalizedIdentifier }] : []),
          ...(isEmail ? [{ email: normalizedIdentifier }] : []),
          { phone: normalizedIdentifier },
          { email: normalizedIdentifier },
        ],
      },
      select: { password: true },
    });

    if (existingUser?.password) {
      return res.json({ success: true, method: "password" });
    }

    if (isPhone) {
      return res.json({ success: true, method: "otp" });
    }

    if (isEmail) {
      return res.json({ success: true, method: "password" });
    }

    return res.status(400).json({
      success: false,
      message: "فرمت ورودی نامعتبر است (باید شماره همراه یا ایمیل باشد)",
    });
  } catch (error) {
    console.error("Check Login Method Error:", error);
    return res.status(500).json({
      success: false,
      message: "خطای داخلی سرور",
    });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLoginMethod = exports.getMe = exports.verifyOtp = exports.sendOtp = void 0;
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * ارسال رمز یکبار مصرف (OTP)
 */
const sendOtp = async (req, res) => {
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
        await prisma_1.prisma.oTP.create({
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
    }
    catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({ success: false, message: "خطای سرور" });
    }
};
exports.sendOtp = sendOtp;
/**
 * تایید رمز یکبار مصرف و ورود/ثبت‌نام کاربر
 */
const verifyOtp = async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: "شماره تلفن و کد تایید الزامی هستند",
            });
        }
        const otpRecord = await prisma_1.prisma.oTP.findFirst({
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
        let user = await prisma_1.prisma.user.findUnique({
            where: { phone },
        });
        let isNewUser = false;
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    phone,
                    role: "employer", // نقش پیش‌فرض مطابق با استور فرانت
                    profileCompleted: false,
                },
            });
            isNewUser = true;
        }
        // تولید توکن JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            phone: user.phone,
        }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "7d" });
        // حذف کدهای OTP مصرف شده برای این شماره
        await prisma_1.prisma.oTP.deleteMany({
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
    }
    catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "خطای داخلی سرور",
        });
    }
};
exports.verifyOtp = verifyOtp;
/**
 * دریافت اطلاعات کاربر لاگین شده
 */
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
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
    }
    catch (error) {
        console.error("Get Me Error:", error);
        return res.status(500).json({ success: false, message: "خطای سرور" });
    }
};
exports.getMe = getMe;
/**
 * بررسی روش ورود (بر اساس ایمیل یا شماره همراه)
 */
const checkLoginMethod = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res
                .status(400)
                .json({ success: false, message: "ورودی الزامی است" });
        }
        const isPhone = /^09\d{9}$/.test(identifier);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
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
    }
    catch (error) {
        console.error("Check Login Method Error:", error);
        return res.status(500).json({
            success: false,
            message: "خطای داخلی سرور",
        });
    }
};
exports.checkLoginMethod = checkLoginMethod;

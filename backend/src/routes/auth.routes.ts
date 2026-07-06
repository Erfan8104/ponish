import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  sendOtp,
  verifyOtp,
  getMe,
  checkLoginMethod,
} from "../controllers/auth.controller";

const router = Router();

/**
 * ارسال کد تایید یکبار مصرف
 */
router.post("/send-otp", sendOtp);

/**
 * تایید کد یکبار مصرف و ورود
 */
router.post("/verify-otp", verifyOtp);

/**
 * دریافت اطلاعات هویت جاری
 */
router.get("/me", authMiddleware, getMe as any);

/**
 * بررسی متد لاگین
 */
router.post("/check-login-method", checkLoginMethod);

export default router;

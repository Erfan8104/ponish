import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  sendOtp,
  verifyOtp,
  getMe,
  loginWithPassword,
  checkLoginMethod,
  completeRegistration,
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
 * ورود با ایمیل/شماره همراه و رمز عبور
 */
router.post("/login-password", loginWithPassword);

/**
 * بررسی متد لاگین
 */
router.post("/check-login-method", checkLoginMethod);

router.put(
  "/complete-registration",
  authMiddleware,
  completeRegistration as any,
);

export default router;

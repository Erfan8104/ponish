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
import {
  validateSendOtp,
  validateVerifyOtp,
  validateCompleteRegistration,
} from "../validators/auth.validator";

const router = Router();

// استفاده از ولیدیتور برای ارسال OTP
router.post("/send-otp", validateSendOtp, sendOtp);

// استفاده از ولیدیتور برای تایید OTP
router.post("/verify-otp", validateVerifyOtp, verifyOtp);

router.get("/me", authMiddleware, getMe as any);
router.post("/login-password", loginWithPassword);
router.post("/check-login-method", checkLoginMethod);
router.put(
  "/complete-registration",
  authMiddleware,
  validateCompleteRegistration,
  completeRegistration as any,
);

export default router;

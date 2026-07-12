"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
/**
 * ارسال کد تایید یکبار مصرف
 */
router.post("/send-otp", auth_controller_1.sendOtp);
/**
 * تایید کد یکبار مصرف و ورود
 */
router.post("/verify-otp", auth_controller_1.verifyOtp);
/**
 * دریافت اطلاعات هویت جاری
 */
router.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.getMe);
/**
 * بررسی متد لاگین
 */
router.post("/check-login-method", auth_controller_1.checkLoginMethod);
exports.default = router;

import { Router } from "express";
import { getChatHistory } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// دریافت پیام‌های چت بر اساس آی‌دی قرارداد
router.get("/history/:contractId", authMiddleware, getChatHistory);

export default router;

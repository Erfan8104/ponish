import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// دریافت لیست پیام‌های یک قرارداد خاص
router.get("/contracts/:contractId/messages", authMiddleware, getMessages);

// ارسال پیام جدید به یک قرارداد
router.post("/contracts/:contractId/messages", authMiddleware, sendMessage);

export default router;

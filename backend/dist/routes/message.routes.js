"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// دریافت پیام‌های چت بر اساس آی‌دی قرارداد
router.get("/history/:contractId", auth_middleware_1.authMiddleware, message_controller_1.getChatHistory);
exports.default = router;

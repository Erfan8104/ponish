import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  adminLogin,
  getAllUsersForAdmin,
  toggleUserStatus, // 🌟 اضافه کردن کنترلر جدید
} from "../controllers/admin.controller";

const router = Router();

// یک مسیر تستی برای ادمین که هم نیاز به لاگین دارد و هم نقش ادمین
router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "خوش آمدید! دسترسی ادمین تایید شد.",
  });
});

// مسیر ورود ادمین (چون کاربر هنوز لاگین نکرده، نیاز به میدلور امنیتی ندارد)
router.post("/login", adminLogin);

// 🌟 مسیرهای مدیریت کاربران (نیازمند لاگین و داشتن دسترسی ادمین)
router.get("/users", authMiddleware, adminMiddleware, getAllUsersForAdmin);
router.patch(
  "/users/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  toggleUserStatus,
);

export default router;

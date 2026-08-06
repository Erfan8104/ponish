import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  adminLogin,
  getAllUsersForAdmin,
  toggleUserStatus,
  getDashboardStats, // 🌟 اضافه شد
} from "../controllers/admin.controller";

const router = Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "خوش آمدید! دسترسی ادمین تایید شد.",
  });
});

router.post("/login", adminLogin);

// 🌟 داشبورد
router.get(
  "/dashboard/stats",
  authMiddleware,
  adminMiddleware,
  getDashboardStats,
);

router.get("/users", authMiddleware, adminMiddleware, getAllUsersForAdmin);
router.patch(
  "/users/:id/toggle-status",
  authMiddleware,
  adminMiddleware,
  toggleUserStatus,
);

export default router;

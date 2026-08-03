import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  adminLogin,
  getAllUsersForAdmin,
} from "../controllers/admin.controller";

const router = Router();

// یک مسیر تستی برای ادمین که هم نیاز به لاگین دارد و هم نقش ادمین
router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "خوش آمدید! دسترسی ادمین تایید شد.",
  });
});

// مسیر ورود ادمین
router.post("/login", adminLogin);
router.get("/users", getAllUsersForAdmin);

export default router;

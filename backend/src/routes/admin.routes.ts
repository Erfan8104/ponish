import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  adminMiddleware,
  requirePermission,
} from "../middleware/admin.middleware";
import {
  adminLogin,
  getAllUsersForAdmin,
  getUserDetail,
  toggleUserStatus,
  verifyUser,
  deleteUser,
  resetUserPassword,
  changeUserRole,
  getDashboardStats,
  getAllProjectsForAdmin,
  publishProject,
  closeProject,
  toggleFeatureProject,
  deleteProjectByAdmin,
  getProjectDetailForAdmin,
  getAllProposalsForAdmin,
  acceptProposalForAdmin,
  rejectProposalForAdmin,
  deleteProposalForAdmin,
} from "../controllers/admin.controller";

const router = Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "خوش آمدید! دسترسی ادمین تایید شد.",
  });
});

router.post("/login", adminLogin);

// داشبورد — کلید permission اختصاصی نداریم، فقط عمومی بودن ادمین کافیست
router.get(
  "/dashboard/stats",
  authMiddleware,
  adminMiddleware,
  getDashboardStats,
);

// مشاهده — SUPER_ADMIN, ADMIN, SUPPORT, FINANCE, MODERATOR همه دسترسی دارند
router.get(
  "/users",
  authMiddleware,
  requirePermission("users.view"),
  getAllUsersForAdmin,
);
router.get(
  "/users/:id",
  authMiddleware,
  requirePermission("users.view"),
  getUserDetail,
);

router.get(
  "/projects/:id",
  authMiddleware,
  requirePermission("projects.view"),
  getProjectDetailForAdmin,
);

router.get(
  "/projects",
  authMiddleware,
  requirePermission("projects.view"),
  getAllProjectsForAdmin,
);

// پیشنهادها — مشاهده با proposals.view (نه projects.view)
router.get(
  "/proposals",
  authMiddleware,
  requirePermission("proposals.view"),
  getAllProposalsForAdmin,
);

// مسدود/فعال‌سازی — فقط SUPER_ADMIN, ADMIN, MODERATOR
router.patch(
  "/users/:id/toggle-status",
  authMiddleware,
  requirePermission("users.ban"),
  toggleUserStatus,
);

// تایید هویت — SUPER_ADMIN, ADMIN, SUPPORT
router.patch(
  "/users/:id/verify",
  authMiddleware,
  requirePermission("users.edit"),
  verifyUser,
);

// حذف — فقط SUPER_ADMIN (طبق rolePermissionMap فقط SUPER_ADMIN کلید users.delete رو داره)
router.delete(
  "/users/:id",
  authMiddleware,
  requirePermission("users.delete"),
  deleteUser,
);

// ری‌ست رمز — حساس است، حداقل users.edit لازم است
router.post(
  "/users/:id/reset-password",
  authMiddleware,
  requirePermission("users.edit"),
  resetUserPassword,
);

// تغییر نقش — users.edit پایه، ولی تبدیل به admin داخل کنترلر چک اضافه دارد (فقط "*")
router.patch(
  "/users/:id/role",
  authMiddleware,
  requirePermission("users.edit"),
  changeUserRole,
);

router.patch(
  "/projects/:id/publish",
  authMiddleware,
  requirePermission("projects.edit"),
  publishProject,
);
router.patch(
  "/projects/:id/close",
  authMiddleware,
  requirePermission("projects.edit"),
  closeProject,
);
router.patch(
  "/projects/:id/feature",
  authMiddleware,
  requirePermission("projects.feature"),
  toggleFeatureProject,
);
router.delete(
  "/projects/:id",
  authMiddleware,
  requirePermission("projects.delete"),
  deleteProjectByAdmin,
);

// پیشنهادها — عملیات نوشتنی (تایید/رد/حذف) با proposals.manage
router.patch(
  "/proposals/:id/accept",
  authMiddleware,
  requirePermission("proposals.manage"),
  acceptProposalForAdmin,
);

router.patch(
  "/proposals/:id/reject",
  authMiddleware,
  requirePermission("proposals.manage"),
  rejectProposalForAdmin,
);

router.delete(
  "/proposals/:id",
  authMiddleware,
  requirePermission("proposals.manage"),
  deleteProposalForAdmin,
);

export default router;

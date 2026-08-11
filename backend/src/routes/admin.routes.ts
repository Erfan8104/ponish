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
  getAllFilesForAdmin,
  getAllSettingsForAdmin,
  updateSettingsByAdmin,
  getAllNotificationsForAdmin,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationByAdmin,
  globalSearchForAdmin,
  getAnalyticsForAdmin,
  deleteFileByAdmin,
  bulkSetUserStatusForAdmin,
  bulkDeleteUsersForAdmin,
  getDashboardStats,
  getAllProjectsForAdmin,
  publishProject,
  closeProject,
  toggleFeatureProject,
  getAllReviewsForAdmin,
  deleteReviewByAdmin,
  deleteProjectByAdmin,
  getAllConversationsForAdmin,
  getConversationThreadForAdmin,
  getProjectDetailForAdmin,
  getAllProposalsForAdmin,
  acceptProposalForAdmin,
  rejectProposalForAdmin,
  deleteProposalForAdmin,
  getAllContractsForAdmin,
  getAllReportsForAdmin,
  getReportDetailForAdmin,
  updateReportStatusByAdmin,
  deleteReportByAdmin,
  getContractDetailForAdmin,
  cancelContractByAdmin,
  completeContractByAdmin,
  resolveContractDisputeByAdmin,
  getAllPaymentsForAdmin,
  getAllCategoriesForAdmin,
  createCategoryByAdmin,
  updateCategoryByAdmin,
  getAllSkillsForAdmin,
  createSkillByAdmin,
  updateSkillByAdmin,
  deleteSkillByAdmin,
  getAllActivityLogsForAdmin,
  mergeSkillsByAdmin,
  deleteCategoryByAdmin,
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

router.get(
  "/messages",
  authMiddleware,
  requirePermission("messages.view"),
  getAllConversationsForAdmin,
);

router.get(
  "/messages/thread",
  authMiddleware,
  requirePermission("messages.view"),
  getConversationThreadForAdmin,
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

router.get(
  "/contracts",
  authMiddleware,
  requirePermission("contracts.view"),
  getAllContractsForAdmin,
);

router.get(
  "/contracts/:id",
  authMiddleware,
  requirePermission("contracts.view"),
  getContractDetailForAdmin,
);

router.patch(
  "/contracts/:id/cancel",
  authMiddleware,
  requirePermission("contracts.cancel"),
  cancelContractByAdmin,
);

router.patch(
  "/contracts/:id/complete",
  authMiddleware,
  requirePermission("contracts.edit"),
  completeContractByAdmin,
);

router.patch(
  "/contracts/:id/resolve-dispute",
  authMiddleware,
  requirePermission("contracts.edit"),
  resolveContractDisputeByAdmin,
);

router.get(
  "/payments",
  authMiddleware,
  requirePermission("payments.view"),
  getAllPaymentsForAdmin,
);

router.get(
  "/categories",
  authMiddleware,
  requirePermission("categories.manage"),
  getAllCategoriesForAdmin,
);

router.post(
  "/categories",
  authMiddleware,
  requirePermission("categories.manage"),
  createCategoryByAdmin,
);

router.patch(
  "/categories/:id",
  authMiddleware,
  requirePermission("categories.manage"),
  updateCategoryByAdmin,
);

router.delete(
  "/categories/:id",
  authMiddleware,
  requirePermission("categories.manage"),
  deleteCategoryByAdmin,
);

router.get(
  "/skills",
  authMiddleware,
  requirePermission("skills.manage"),
  getAllSkillsForAdmin,
);

router.post(
  "/skills",
  authMiddleware,
  requirePermission("skills.manage"),
  createSkillByAdmin,
);

router.patch(
  "/skills/:id",
  authMiddleware,
  requirePermission("skills.manage"),
  updateSkillByAdmin,
);

router.delete(
  "/skills/:id",
  authMiddleware,
  requirePermission("skills.manage"),
  deleteSkillByAdmin,
);

router.post(
  "/skills/merge",
  authMiddleware,
  requirePermission("skills.manage"),
  mergeSkillsByAdmin,
);

router.get(
  "/reviews",
  authMiddleware,
  requirePermission("reviews.view"),
  getAllReviewsForAdmin,
);

router.delete(
  "/reviews/:id",
  authMiddleware,
  requirePermission("reviews.delete"),
  deleteReviewByAdmin,
);

// داخل router:
router.get(
  "/files",
  authMiddleware,
  requirePermission("settings.view"), // یا هر permission مناسب
  getAllFilesForAdmin,
);

router.delete(
  "/files/:type/:id",
  authMiddleware,
  requirePermission("settings.manage"),
  deleteFileByAdmin,
);

// داخل router:
router.get(
  "/reports",
  authMiddleware,
  requirePermission("reports.view"),
  getAllReportsForAdmin,
);

router.get(
  "/reports/:id",
  authMiddleware,
  requirePermission("reports.view"),
  getReportDetailForAdmin,
);

router.patch(
  "/reports/:id",
  authMiddleware,
  requirePermission("reports.view"), // یا reports.manage اگر بعداً اضافه کردی
  updateReportStatusByAdmin,
);

router.get(
  "/activity-logs",
  authMiddleware,
  requirePermission("settings.view"), // یا permission مناسب
  getAllActivityLogsForAdmin,
);

router.delete(
  "/reports/:id",
  authMiddleware,
  requirePermission("reports.view"),
  deleteReportByAdmin,
);

router.get(
  "/settings",
  authMiddleware,
  requirePermission("settings.view"),
  getAllSettingsForAdmin,
);

router.put(
  "/settings",
  authMiddleware,
  requirePermission("settings.manage"),
  updateSettingsByAdmin,
);

router.get(
  "/notifications",
  authMiddleware,
  adminMiddleware,
  getAllNotificationsForAdmin,
);

router.patch(
  "/notifications/:id/read",
  authMiddleware,
  adminMiddleware,
  markNotificationRead,
);

router.patch(
  "/notifications/mark-all-read",
  authMiddleware,
  adminMiddleware,
  markAllNotificationsRead,
);

router.delete(
  "/notifications/:id",
  authMiddleware,
  requirePermission("settings.manage"),
  deleteNotificationByAdmin,
);

router.get(
  "/analytics",
  authMiddleware,
  requirePermission("reports.view"),
  getAnalyticsForAdmin,
);

router.patch(
  "/users/bulk-status",
  authMiddleware,
  requirePermission("users.ban"),
  bulkSetUserStatusForAdmin,
);

router.delete(
  "/users/bulk",
  authMiddleware,
  requirePermission("users.delete"),
  bulkDeleteUsersForAdmin,
);

router.get("/search", authMiddleware, adminMiddleware, globalSearchForAdmin);
export default router;

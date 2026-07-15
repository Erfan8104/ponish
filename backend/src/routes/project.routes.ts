import { Router } from "express";
import {
  getProjectProposals,
  getFreelancerContracts,
  getMyProjects,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  acceptProposal,
  submitProposal,
  getAcceptedProjects,
  rejectAcceptedProposal, // 👈 این متد را ایمپورت کنید
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

/* ==============================================
   ۱. روت‌های ثابت و محافظت‌شده
   ============================================== */
router.get(
  "/freelancer/active-contracts",
  authMiddleware,
  getFreelancerContracts,
);
router.get("/accepted-projects", authMiddleware, getAcceptedProjects);
router.post("/proposals/submit", authMiddleware, submitProposal);

router.get("/my-projects", authMiddleware, getMyProjects);
router.post(
  "/create",
  authMiddleware,
  upload.array("attachments"),
  createProject,
);

/* ==============================================
   ۲. روت‌های عمومی
   ============================================== */
router.get("/list", getProjects);

/* ==============================================
   ۳. روت‌های دارای متغیر پویا (:id)
   ============================================== */
router.get("/detail/:id", getProjectById);
router.get("/detail/:id/proposals", authMiddleware, getProjectProposals);
router.put("/update/:id", authMiddleware, updateProject);
router.delete("/delete/:id", authMiddleware, deleteProject);

// تایید پیشنهاد (قبلاً داشتید)
router.patch("/proposals/:id/accept", authMiddleware, acceptProposal);

// 🌟 جدید: رد کردن توافق توسط کارفرما (برگرداندن پروژه به حالت open)
router.patch(
  "/proposals/:contractId/reject",
  authMiddleware,
  rejectAcceptedProposal,
);

export default router;

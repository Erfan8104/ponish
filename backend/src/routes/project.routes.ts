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
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

/* ==============================================
   ۱. روت‌های ثابت و محافظت‌شده (بدون متغیر :id)
   ============================================== */
// روت‌های مربوط به فریلنسر
router.get(
  "/freelancer/active-contracts",
  authMiddleware,
  getFreelancerContracts,
);
router.get("/accepted-projects", authMiddleware, getAcceptedProjects);
router.post("/proposals/submit", authMiddleware, submitProposal);

// روت‌های مربوط به کارفرما
router.get("/my-projects", authMiddleware, getMyProjects); // ⚠️ حتماً باید بالاتر از روت‌های دارای :id باشد
router.post(
  "/create",
  authMiddleware,
  upload.array("attachments"),
  createProject,
);

/* ==============================================
   ۲. روت‌های عمومی (نیاز به توکن ندارند)
   ============================================== */
router.get("/list", getProjects);

/* ==============================================
   ۳. روت‌های دارای متغیر پویا (:id) - در انتهای فایل
   ============================================== */
router.get("/detail/:id", getProjectById);
router.get("/detail/:id/proposals", authMiddleware, getProjectProposals);
router.put("/update/:id", authMiddleware, updateProject);
router.delete("/delete/:id", authMiddleware, deleteProject);

// 🌟 روتی که متد acceptProposal را صدا می‌زند (مبلغ جدید چت در req.body ارسال می‌شود)
router.patch("/proposals/:id/accept", authMiddleware, acceptProposal);

export default router;

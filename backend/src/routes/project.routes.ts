import { Router } from "express";
import {
  getProjectProposals,
  getMyProjects,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  acceptProposal,
  submitProposal, // 👈 اضافه شد
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// روت‌های عمومی (نیاز به لاگین ندارند - برای فید عمومی پروژه‌ها)
router.get("/list", getProjects); // مسیر: /api/projects/list
router.get("/detail/:id", getProjectById); // مسیر: /api/projects/detail/:id
router.get("/detail/:id/proposals", authMiddleware, getProjectProposals);
router.post("/proposals/submit", authMiddleware, submitProposal); // مسیر نهایی: /api/projects/proposals/submit
// روت‌های محافظت‌شده (مخصوص کارفرما)
router.post(
  "/create",
  authMiddleware,
  upload.array("attachments"),
  createProject,
);
router.put("/update/:id", authMiddleware, updateProject); // مسیر: /api/projects/update/:id
router.delete("/delete/:id", authMiddleware, deleteProject); // مسیر: /api/projects/delete/:id
router.get("/my-projects", authMiddleware, getMyProjects); // ← این را اضافه کن
router.patch("/proposals/:id/accept", authMiddleware, acceptProposal); // 👈 اضافه شد

export default router;

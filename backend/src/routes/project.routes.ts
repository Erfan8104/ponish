import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// روت‌های عمومی (نیاز به لاگین ندارند - برای فید عمومی پروژه‌ها)
router.get("/list", getProjects); // مسیر: /api/projects/list
router.get("/detail/:id", getProjectById); // مسیر: /api/projects/detail/:id

// روت‌های محافظت‌شده (مخصوص کارفرما)
router.post(
  "/create",
  authMiddleware,
  upload.array("attachments"),
  createProject,
);
router.put("/update/:id", authMiddleware, updateProject); // مسیر: /api/projects/update/:id
router.delete("/delete/:id", authMiddleware, deleteProject); // مسیر: /api/projects/delete/:id

export default router;

import { Router } from "express";
import {
  createProject,
  getUserProjects,
} from "./../controllers/project.controller";
import { authMiddleware } from "./../middleware/auth.middleware"; // آدرس میدل‌ور خودت را چک کن

const router = Router();

// هر دو روت اکنون کاملاً محافظت شده هستند
router.post("/projects", authMiddleware, createProject);
router.get("/projects", authMiddleware, getUserProjects);

export default router;

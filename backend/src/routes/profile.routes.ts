import { Router } from "express";
import {
  updateEmployerProfile,
  updateFreelancerProfile,
} from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.put("/employer", authMiddleware, updateEmployerProfile);
router.put("/freelancer", authMiddleware, updateFreelancerProfile);

export default router;

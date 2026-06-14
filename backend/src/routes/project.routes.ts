import { Router } from "express";
import { createProject } from "./../controllers/project.controller";

const router = Router();

// Endpoint: POST /api/projects
router.post("/projects", createProject);

export default router;

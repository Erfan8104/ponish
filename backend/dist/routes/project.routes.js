"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.get("/freelancer/active-contracts", auth_middleware_1.authMiddleware, project_controller_1.getFreelancerContracts);
// روت‌های عمومی (نیاز به لاگین ندارند - برای فید عمومی پروژه‌ها)
router.get("/list", project_controller_1.getProjects); // مسیر: /api/projects/list
router.get("/detail/:id", project_controller_1.getProjectById); // مسیر: /api/projects/detail/:id
router.get("/detail/:id/proposals", auth_middleware_1.authMiddleware, project_controller_1.getProjectProposals);
router.post("/proposals/submit", auth_middleware_1.authMiddleware, project_controller_1.submitProposal); // مسیر نهایی: /api/projects/proposals/submit
// روت‌های محافظت‌شده (مخصوص کارفرما)
router.post("/create", auth_middleware_1.authMiddleware, upload_middleware_1.upload.array("attachments"), project_controller_1.createProject);
router.put("/update/:id", auth_middleware_1.authMiddleware, project_controller_1.updateProject); // مسیر: /api/projects/update/:id
router.delete("/delete/:id", auth_middleware_1.authMiddleware, project_controller_1.deleteProject); // مسیر: /api/projects/delete/:id
router.get("/my-projects", auth_middleware_1.authMiddleware, project_controller_1.getMyProjects); // ← این را اضافه کن
router.patch("/proposals/:id/accept", auth_middleware_1.authMiddleware, project_controller_1.acceptProposal); // 👈 اضافه شد
exports.default = router;

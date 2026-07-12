"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.put("/employer", auth_middleware_1.authMiddleware, profile_controller_1.updateEmployerProfile);
router.put("/freelancer", auth_middleware_1.authMiddleware, profile_controller_1.updateFreelancerProfile);
exports.default = router;

import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { createConsultationSchema } from "../validators/consultation.validator";
import { createConsultation } from "../controllers/consultation.controller";

const router = Router();

router.post("/", validate(createConsultationSchema), createConsultation);

export default router;

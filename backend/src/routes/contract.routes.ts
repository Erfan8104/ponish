import { Router } from "express";
import { contractController } from "../controllers/contract.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// کارفرما با ارسال توکن معتبر پیشنهاد الحاقیه می‌دهد
router.post(
  "/:contractId/amendments",
  authMiddleware,
  contractController.createAmendment,
);

// روت جدید برای دریافت اصلاحیه‌ها (هم کارفرما و هم فریلنسر به آن نیاز دارند)
router.get(
  "/:contractId/amendments",
  authMiddleware,
  contractController.getAmendments,
);
// فریلنسر با ارسال توکن معتبر الحاقیه را تایید یا رد می‌کند
router.patch(
  "/amendments/:amendmentId",
  authMiddleware,
  contractController.respondToAmendment,
);

export default router;

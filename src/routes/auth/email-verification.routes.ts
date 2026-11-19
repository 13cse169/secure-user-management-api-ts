import { Router } from "express";
import { verifyEmail } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { verifyEmailSchema } from "../../validators/auth.validator.js";

const router = Router();

router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

export default router;
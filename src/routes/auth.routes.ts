import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { register, verifyEmail } from "../controllers/auth.controller.js";
import { registerSchema, verifyEmailSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

export default router;
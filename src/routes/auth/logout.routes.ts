import { Router } from "express";
import { logout } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { refreshTokenSchema } from "../../validators/auth.validator.js";

const router = Router();

router.post("/logout", validate(refreshTokenSchema), logout);

export default router;

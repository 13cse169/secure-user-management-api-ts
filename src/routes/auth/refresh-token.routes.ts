import { Router } from "express";
import { refreshTokens } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { refreshTokenSchema } from "../../validators/auth.validator.js";

const router = Router();

router.post("/refresh-token", validate(refreshTokenSchema), refreshTokens);

export default router;

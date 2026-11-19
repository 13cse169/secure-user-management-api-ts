import { Router } from "express";
import registrationRouter from "./registration.routes.js";
import emailVerificationRouter from "./email-verification.routes.js";
import loginRouter from "./login.routes.js";
import refreshTokenRouter from "./refresh-token.routes.js";
import logoutRouter from "./logout.routes.js";

const router = Router();

router.use(registrationRouter);
router.use(emailVerificationRouter);
router.use(loginRouter);
router.use(refreshTokenRouter);
router.use(logoutRouter);

export default router;
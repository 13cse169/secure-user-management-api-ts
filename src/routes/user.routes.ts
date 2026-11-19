import { Router } from "express";
import { getUsers, getMyProfile } from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { sendResponse } from "../utils/api-response.js";

const router = Router();

router.get("/", getUsers);

router.get("/protected", authenticate, (req, res) => {
    sendResponse(
        res,
        200,
        "Authentication successful",
        {
            userId: res.locals.userId
        }
    );
});

router.get("/me", authenticate, getMyProfile);


export default router;
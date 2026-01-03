// routes/notification.routes.ts
import { Router } from "express";
import { registerToken, sendNotification } from "../controllers/notification.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/token", auth, registerToken);
router.post("/send", auth, sendNotification);
export default router;

import { Router } from "express";
import { helpNotification, registerToken, sendNotification } from "../controllers/notification.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/token", auth, registerToken);
router.post("/send", auth, sendNotification);
router.get("/health", helpNotification);
export default router;

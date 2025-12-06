import { Router } from "express";
import { auth } from "../middleware/auth";
import { registerSubscription } from "../controllers/push.controller";

const router = Router();

router.post("/subscribe", auth, registerSubscription);

export default router;

import { Router } from "express";
import { testWhatsApp } from "../controllers/whatsapp.controller";

const router = Router();

router.post("/test", testWhatsApp);

export default router;

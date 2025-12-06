import { Router } from "express";
import { register, login, updateColors, getPalette } from "../controllers/user.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// palette routes (protected - user must be owner)
router.get("/:id/palette", auth, getPalette);
router.put("/:id/palette", auth, updateColors);

export default router;

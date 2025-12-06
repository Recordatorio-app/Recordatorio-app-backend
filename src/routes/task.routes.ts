import { Router } from "express";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", auth, getTasks);
router.post("/", auth, createTask);
router.get("/:id", auth, getTaskById);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

export default router;
    
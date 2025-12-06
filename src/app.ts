import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import pushRoutes from "./routes/push.routes";
import whatsappRoutes from "./routes/whastapp.routes";
import {startReminders} from"./jobs/reminder.job";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/whatsapp", whatsappRoutes);
startReminders();
connectDB();

export default app;

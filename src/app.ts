import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";
import notificationRoutes from "./routes/notification.routes";
import whatsappRoutes from "./routes/whastapp.routes";
import {startReminders} from"./jobs/reminder.job";
import {startPushNotifications} from "./jobs/push.job";


const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "https://recordatorio-app.vercel.app/"],
    credentials: true,
}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/notifications", notificationRoutes);
startReminders();
startPushNotifications();
connectDB();

export default app;

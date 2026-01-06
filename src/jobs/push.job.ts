import cron from "node-cron";
import Task from "../models/Task";
import NotificationToken from "../models/NotificationToken";
import { sendPush } from "../services/notification.service";

export const startPushNotifications = () => {
  cron.schedule("*/10 * * * *", async () => {
  console.log("🔔 Cron Push Notifications ejecutándose");
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const tasks = await Task.find({
    status: "pendiente",
    reminderDate: {
      $ne: null,
      $gte: tenMinutesAgo,
      $lte: threeDaysLater,
    },
    $or: [
      { lastReminderDate: null },
      { lastReminderDate: { $lte: tenMinutesAgo } },
    ],
  });

  console.log("📌 Tareas encontradas:", tasks.length);

  for (const task of tasks) {
    const tokens = await NotificationToken.find({ userId: task.userId });

    if (!tokens.length) continue;

    await Promise.all(
      tokens.map(t =>
        sendPush(
          t.token,
          "⏰ Recordatorio de tarea",
          `La tarea "${task.title}" vence pronto`
        )
      )
    );

    task.lastReminderDate = now;
    task.reminderSentDates ??= [];
    task.reminderSentDates.push(now);
    await task.save();
  }
});
  console.log("🔔 Cron Push Notifications ejecutándose");
};
import cron from "node-cron";
import Task from "../models/Task";
import NotificationToken from "../models/NotificationToken";
import { sendPush } from "../services/notification.service";

export const startPushNotifications = () => {
  cron.schedule("*/1 * * * *", async () => {

    console.log("🔔 Cron push notifications ejecutándose");

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const tasks = await Task.find({
      status: "pendiente",
      reminderDate: {
        $ne: null,
        $gte: now,
        $lte: threeDaysLater,
      },
      $or: [
        { lastReminderDate: null },
        { lastReminderDate: { $lte: tenMinutesAgo } },
      ],
    });

    for (const task of tasks) {
      const tokens = await NotificationToken.find({
        userId: task.userId,
      });

      if (!tokens.length) continue;

      await Promise.all(
        tokens.map((t) =>
          sendPush(
            t.token,
            "⏰ Recordatorio de tarea",
            `La tarea "${task.title}" vence pronto`
          )
        )
      );

      // actualizar control de recordatorios
      task.lastReminderDate = now;
      task.reminderSentDates?.push(now);
      await task.save();
    }
  });
  console.log("✅ Push notification job activo (3 días antes, cada 10 minutos)");
};

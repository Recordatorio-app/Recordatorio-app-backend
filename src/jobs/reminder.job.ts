import cron from "node-cron";
import Task from "../models/Task";
import { sendWhatsappTemplate } from "../services/whatsapp.service";
import User from "../models/User";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function startReminders() {
  cron.schedule(
    "*/10 * * * *", // cada 10 min
    async () => {
      try {
        const now = new Date();

        const tasks = await Task.find({
          status: "pendiente",
          reminderDate: { $exists: true, $ne: null },
        }).populate("userId");
        // ===== LOGS DE DEPURACIÓN =====
        console.log("🚀 Cron ejecutado a:", now.toLocaleString());
        console.log("Tareas encontradas:", tasks.length);
        tasks.forEach((task) => {
          console.log({
            title: task.title,
            reminderDate: task.reminderDate,
            lastReminderDate: task.lastReminderDate,
            userPhone: (task.userId as any).phone,
          });
        });
        // ================================

        for (const task of tasks) {
          const due = new Date(task.reminderDate!);
          const user: any = (task as any).userId;
          if (!user || !user.phone) continue;

          const start = new Date(due.getTime() - THREE_DAYS);

          if (now < start) continue;

          const last = task.lastReminderDate
            ? new Date(task.lastReminderDate)
            : null;

          const shouldSend =
            !last || now.getTime() - last.getTime() >= TEN_MINUTES;

          if (!shouldSend) continue;

          const sendResult = await sendWhatsappTemplate(
            user.phone,
            "message_simple",
            "es_PE",[
              { type: "text", text: "Hola! "+user.name },
              { type: "text", text: `Recordatorio de tarea pendiente:` },
              { type: "text", text: due.toLocaleDateString("es-PE") },
              { type: "text", text: task.title },
              { type: "text", text: task.status.toUpperCase() },
            ]
          );

          if (sendResult) {
            task.lastReminderDate = new Date();
            task.reminderSentDates = [
              ...(task.reminderSentDates || []),
              new Date(),
            ];
            await task.save();
          }
        }
      } catch (err) {
        console.error("Reminder job error:", err);
      }
    },
    {
      scheduled: true,
      timezone: "America/Lima",
    }
  );

  console.log("Reminder job scheduled.");
}

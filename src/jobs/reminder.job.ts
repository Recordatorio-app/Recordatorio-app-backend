import cron from "node-cron";
import Task from "../models/Task";
import { sendWhatsappTemplate } from "../services/whatsapp.service";
import User from "../models/User";

export function startReminders() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

  cron.schedule(
    "*/10 * * * *", // cron liviano
    async () => {
      const now = new Date();

      const tasks = await Task.find({
        status: "pendiente",
        reminderDate: { $exists: true, $ne: null },
      }).populate("userId");

      for (const task of tasks) {
        const user: any = task.userId;
        if (!user?.phone) continue;

        const due = new Date(task.reminderDate);
        const start = new Date(due.getTime() - THREE_DAYS);

        //  SOLO a partir de 3 días antes
        if (now < start) continue;

        const last = task.lastReminderDate
          ? new Date(task.lastReminderDate)
          : null;

        // máximo 1 WhatsApp cada 6 horas
        if (last && now.getTime() - last.getTime() < SIX_HOURS) continue;

        const sent = await sendWhatsappTemplate(
          user.phone,
          "message_simple",
          "es_PE",
          [
            { type: "text", text: `${user.name}! 👋` },
            { type: "text", text: task.title },
            {
              type: "text",
              text: due.toLocaleDateString("es-PE"),
            },
            { type: "text", text: task.description || "-" },
            { type: "text", text: task.status.toUpperCase() },
          ]
        );

        if (sent) {
          task.lastReminderDate = now;
          await task.save();
        }
      }
    },
    { timezone: "America/Lima" }
  );

  console.log("✅ Reminder job activo (3 días antes, cada 6 horas)");
}

/*
-- FUNCION PARA PRUEBAS--
const TEN_MINUTES = 10 * 60 * 1000;

export function startReminders() {
  cron.schedule(
    async () => {
      try {
        const now = new Date();
        console.log("⏰ Cron ejecutado:", now.toLocaleString());

        const tasks = await Task.find({
          status: "pendiente",
          reminderDate: { $exists: true, $ne: null },
        }).populate("userId");

        for (const task of tasks) {
          const user: any = task.userId;
          if (!user?.phone) continue;
          
          // 👉 ENVÍA SIEMPRE cada 10 minutos
          const sendResult = await sendWhatsappTemplate(
            user.phone,
            "message_simple",
            "es_PE",
            [
              { type: "text", text: `${user.name}! 👋` },
              { type: "text", text: task.title },
              { type: "text", text: new Date(task.reminderDate!).toLocaleDateString("es-PE") },
              { type: "text", text: task.description || "-" },
              { type: "text", text: task.status.toUpperCase() },
            ]
          );

          if (sendResult) {
            task.lastReminderDate = now;
            task.reminderSentDates.push(now);
            await task.save();
            console.log("📤 Mensaje enviado a:", user.phone);
          }
        }
      } catch (err) {
        console.error("❌ Reminder job error:", err);
      }
    },
    { timezone: "America/Lima" }
  );

  console.log("✅ Reminder job activo (cada 2 min)");
}*/

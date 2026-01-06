// controllers/notification.controller.ts
import { Response } from "express";
import { saveToken } from "../services/notification.service";
import NotificationToken from "../models/NotificationToken";
import { sendPush } from "../services/notification.service";
import { AuthRequest } from "../middleware/auth";

export const registerToken = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    // 👇 normalmente viene del middleware auth
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    await saveToken(userId, token);

    res.status(201).json({ message: "Token guardado" });
  } catch (error) {
    res.status(500).json({ message: "Error guardando token" });
  }
};

export const sendNotification = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "No autorizado" });
  }
  try {
      const { title, body } = req.body;
  const userId = req.userId;
  const tokens = await NotificationToken.find({ userId });

  await Promise.all(tokens.map((t) => sendPush(t.token, title, body)));

  res.status(200).json({ message: "Notificación enviada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error enviando notificación" });
  }

};

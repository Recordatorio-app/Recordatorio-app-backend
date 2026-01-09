// controllers/notification.controller.ts
import { Response } from "express";
import { saveToken } from "../services/notification.service";
import NotificationToken from "../models/NotificationToken";
import { sendPush } from "../services/notification.service";
import { AuthRequest } from "../middleware/auth";

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Registro y envío de notificaciones push (Firebase Cloud Messaging)
 */

/**
 * @swagger
 * /api/notifications/register-token:
 *   post:
 *     summary: Registrar token de notificaciones push
 *     description: >
 *       Registra un token de Firebase Cloud Messaging (FCM) asociado al usuario autenticado.
 *       Este token se utiliza posteriormente para el envío de notificaciones push.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM del dispositivo o navegador
 *                 example: "fcm_token_xxxxxxxxxxxxxxxxx"
 *     responses:
 *       201:
 *         description: Token registrado correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Token guardado
 *       400:
 *         description: Token no enviado
 *         content:
 *           application/json:
 *             example:
 *               message: Token requerido
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             example:
 *               message: Error guardando token
 */

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
/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Enviar notificación push al usuario autenticado
 *     description: >
 *       Envía una notificación push a todos los dispositivos registrados
 *       del usuario autenticado usando Firebase Cloud Messaging.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: Recordatorio pendiente
 *               body:
 *                 type: string
 *                 example: Tienes una tarea que vence hoy a las 3:00 PM
 *     responses:
 *       200:
 *         description: Notificación enviada correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Notificación enviada exitosamente
 *       401:
 *         description: Usuario no autorizado
 *         content:
 *           application/json:
 *             example:
 *               message: No autorizado
 *       500:
 *         description: Error enviando notificación
 *         content:
 *           application/json:
 *             example:
 *               message: Error enviando notificación
 */

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

export const helpNotification = async (req: AuthRequest, res: Response) => {
  res.status(200).send("OK");
}

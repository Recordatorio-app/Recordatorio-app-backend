import { Request, Response } from "express";
import { sendWhatsappTemplate } from "../services/whatsapp.service";
/**
 * @swagger
 * tags:
 *   - name: WhatsApp
 *     description: |
 *       Endpoints para envío de mensajes por WhatsApp usando
 *       plantillas previamente aprobadas por Meta.
 *       Plantilla usada en este test: "message_simple"
 *       Idioma: es_PE
 */

/**
 * @swagger
 * /api/whatsapp/test:
 *   post:
 *     summary: Enviar mensaje de prueba por WhatsApp
 *     tags:
 *       - WhatsApp
 *     description: |
 *       Este endpoint envía un mensaje de prueba utilizando la API
 *       de WhatsApp Business y una plantilla previamente aprobada por Meta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 example: "51999999999"
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: El campo 'to' es requerido
 *       500:
 *         description: Error enviando mensaje
 */


export const testWhatsApp = async (req: Request, res: Response) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ msg: "El campo 'to' es requerido" });
    }
    const data = [
      { type: "text", text: "Bienvenido a ToDoApp!" },
      { type: "text", text: "Mensaje de prueba usando plantillas" },
      { type: "text", text: "15/12/2025" },
      { type: "text", text: "Hola" },
      { type: "text", text: "PENDIENTE" },
    ];
    // Prueba usando plantilla hello_world
    const result = await sendWhatsappTemplate(
      to,
      "message_simple",
      "es_PE",
      data
    );

    return res.json({
      ok: true,
      message: "Mensaje enviado",
      result,
    });
  } catch (err: any) {
    console.error("WhatsApp test error:", err.response?.data || err.message);
    return res.status(500).json({
      ok: false,
      msg: "Error enviando mensaje",
      error: err.response?.data || err.message,
    });
  }
};

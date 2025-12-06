import { Request, Response } from "express";
import { sendWhatsappTemplate } from "../services/whatsapp.service";

export const testWhatsApp = async (req: Request, res: Response) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ msg: "El campo 'to' es requerido" });
    }

    // Prueba usando plantilla hello_world
    const result = await sendWhatsappTemplate(to, "hello_world", "en_US");

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

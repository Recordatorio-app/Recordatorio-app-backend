import { Request, Response } from "express";
import { sendWhatsappTemplate } from "../services/whatsapp.service";

export const testWhatsApp = async (req: Request, res: Response) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ msg: "El campo 'to' es requerido" });
    }
    const data =[
      {type:"text",text:"Bienvenido a ToDoApp!"},
      {type:"text",text:"Mensaje de prueba usando plantillas"},
      {type:"text",text:"15/12/2025"},
      {type:"text",text:"Hola mi bb"},
      {type:"text",text:"PENDIENTE"},
    ]
    // Prueba usando plantilla hello_world
    const result = await sendWhatsappTemplate(to, "message_simple", "es_PE",data);

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

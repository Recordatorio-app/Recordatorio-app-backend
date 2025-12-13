import axios from "axios";

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

export async function sendWhatsappTemplate(to: string, templateName: string, lang: string,components:any) {
  try {
    const url = `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`;

    const body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: lang
        },
        components:[
          {
            type:"body",
            parameters: components
          }
        ]
      }
    };

    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return res.data;
  } catch (err: any) {
    console.error("Template WA Error:", err.response?.data || err.message);
    return false;
  }
}

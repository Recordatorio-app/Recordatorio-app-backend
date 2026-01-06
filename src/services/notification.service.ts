import NotificationToken from "../models/NotificationToken";
import { messaging } from "../config/fireBasead";

export const saveToken = async (userId: string, token: string) => {
  const exists = await NotificationToken.findOne({ token });
  if (exists) return exists;

  return await NotificationToken.create({ userId, token });
};

export const sendPush = async (token: string, title: string, body: string) => {
  try {
    await messaging.send({
      token,
      data: {
        title,
        body,
        tag: Date.now().toString(),
      },
    });
  } catch (error: any) {
    if (error.code === "messaging/registration-token-not-registered") {
      console.log("🔥 Token inválido, eliminando:", token);
      await NotificationToken.deleteOne({ token });
    } else {
      throw error;
    }
  }
};

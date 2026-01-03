import NotificationToken from "../models/NotificationToken";
import { messaging } from "../config/fireBasead";

export const saveToken = async (userId: string, token: string) => {
  const exists = await NotificationToken.findOne({ token });
  if (exists) return exists;

  return await NotificationToken.create({ userId, token });
};

export const sendPush = async (token: string, title: string, body: string) => {
  return await messaging.send({
    token,
    notification: {
      title,
      body,
    },
    webpush:{
      notification:{
        tag: Date.now().toString(),
      }
    }
  });
};

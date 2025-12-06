import webpush from "web-push";
import PushSubscription from "../models/PushSubcription";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const sendPushToUser = async (userId: string, payloadData: any) => {
  const subs = await PushSubscription.find({ userId });

  if (!subs.length) return false;

  const payload = JSON.stringify(payloadData);

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
    } catch (err) {
      console.log("❌ Error enviando push:", err);
    }
  }

  return true;
};

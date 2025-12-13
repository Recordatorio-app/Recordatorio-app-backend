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
    } catch (err: any) {
      console.log("❌ Error enviando push:", err.statusCode);

      if (err.statusCode === 404 || err.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: sub._id });
        console.log("🗑️ Suscripción eliminada");
      }
    }
  }

  return true;
};

import PushSubscription from "../models/PushSubcription";
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";

export const registerSubscription = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { subscription } = req.body;

  if (!subscription) {
    return res.status(400).json({ msg: "Subscription requerida" });
  }

  const saved = await PushSubscription.findOneAndUpdate(
    { userId },
    { subscription },
    { upsert: true, new: true }
  );

  res.json({ ok: true, saved });
};

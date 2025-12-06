import mongoose, { Schema, Document } from "mongoose";
import { ColorKey } from "../utils/defaultPalette";

export interface Task extends Document {
  title: string;
  description?: string;
  status: "pendiente" | "completado";
  reminderDate?: Date | null;
  userId: mongoose.Types.ObjectId;
  colorKey: ColorKey;
  lastReminderDate?: Date | null;
  reminderSentDates?: Date[];
}

const TaskSchema = new Schema<Task>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pendiente","completado"], default: "pendiente" },
    reminderDate: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    colorKey: { type: String, required: true, enum: ["urgente","importante","normal","baja","personal","otro"] },
    lastReminderDate: { type: Date, default: null },
    reminderSentDates: { type: [Date], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model<Task>("Task", TaskSchema);

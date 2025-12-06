import mongoose, { Schema, Document } from "mongoose";
import { DEFAULT_PALETTE } from "../utils/defaultPalette";

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  colorPalette: Record<string, string>; // keys fixed but typed loosely
}

const paletteSchema = new Schema(
  {
    key: { type: String },
    color: { type: String }
  },
  { _id: false }
);

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String }, 

    colorPalette: {
      type: Object,
      default: DEFAULT_PALETTE
    }
  },
  { timestamps: true }
);

export default mongoose.model<User>("User", UserSchema);

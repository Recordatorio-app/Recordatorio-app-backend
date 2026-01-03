import { Schema, model } from "mongoose";

const NotificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true, 
    },
  },
  { timestamps: true }
);

export default model("NotificationToken", NotificationTokenSchema);

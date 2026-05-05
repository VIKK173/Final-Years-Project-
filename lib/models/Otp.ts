import { Schema, model, models, type InferSchemaType } from "mongoose";

const otpSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for automatic deletion
    },
  },
  {
    timestamps: true,
  }
);

export type Otp = InferSchemaType<typeof otpSchema>;
export const OtpModel = models.Otp || model("Otp", otpSchema);

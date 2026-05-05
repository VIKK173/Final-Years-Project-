import { Schema, model, models, type InferSchemaType } from "mongoose";

const inquirySchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    enquiryType: { type: String, default: "other", trim: true },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    isUrgent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
    },
    adminReply: { type: String, default: "" },
    userId: { type: String, default: "" }, // Clerk userId if logged in
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1 });

export type Inquiry = InferSchemaType<typeof inquirySchema>;
if (process.env.NODE_ENV === "development" && models.Inquiry) {
  delete models.Inquiry;
}
export const InquiryModel = models.Inquiry || model("Inquiry", inquirySchema);

import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const feedbackSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    workerId: {
      type: Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    serviceId: {
      type: Types.ObjectId,
      ref: "Service",
      default: null,
    },
    userName: {
      type: String,
      default: "",
    },
    serviceStars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    workerStars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ bookingId: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ serviceStars: 1 });

export type Feedback = InferSchemaType<typeof feedbackSchema>;
// Safe model registration - only override in dev to allow schema changes
if (process.env.NODE_ENV === "development" && models.Feedback) {
  delete models.Feedback;
}
export const FeedbackModel = models.Feedback || model("Feedback", feedbackSchema);

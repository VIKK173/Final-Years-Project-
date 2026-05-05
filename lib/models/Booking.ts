import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
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
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
      trim: true,
    },
    bookingCode: {
      type: String,
      default: "",
      trim: true,
    },
    subService: {
      type: String,
      default: "",
      trim: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "completed", "cancelled", "confirmed", "in_progress"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    address: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    customerName: {
      type: String,
      default: "",
    },
    customerPhone: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingCode: 1 });

export type Booking = InferSchemaType<typeof bookingSchema>;
if (models.Booking) {
  delete models.Booking;
}
export const BookingModel = model("Booking", bookingSchema);

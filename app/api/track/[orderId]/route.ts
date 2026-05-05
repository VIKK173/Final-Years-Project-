import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { UserModel } from "@/lib/models/User";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find booking by ID or booking code
    const booking = await BookingModel.findOne({
      $or: [
        { _id: orderId },
        { bookingCode: orderId },
        { bookingCode: `#${orderId}` }
      ]
    })
    .populate('userId', 'fullName email phone')
    .populate('workerId', 'fullName phone')
    .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const bookingData = booking as any;

    // Determine tracking status based on booking status
    let trackingStatus = "booked";
    let timestamp = bookingData.createdAt;
    let estimatedArrival = "";

    switch (bookingData.status) {
      case "pending":
        trackingStatus = "booked";
        break;
      case "confirmed":
        trackingStatus = "confirmed";
        break;
      case "in_progress":
        trackingStatus = "worker_assigned";
        break;
      case "completed":
        trackingStatus = "completed";
        break;
      case "cancelled":
        trackingStatus = "cancelled";
        break;
      default:
        trackingStatus = "confirmed";
    }

    // Simulate real-time tracking updates
    if (bookingData.status === "confirmed") {
      // Randomly assign some orders to workers for demo
      if (Math.random() > 0.5) {
        trackingStatus = "worker_assigned";
        estimatedArrival = new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    if (bookingData.status === "in_progress" && Math.random() > 0.7) {
      trackingStatus = "on_the_way";
      estimatedArrival = new Date(Date.now() + 30 * 60 * 1000).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Build customer info - use saved fields first, then populate fallback
    const customerName = bookingData.customerName || bookingData.userId?.fullName || "Customer";
    const customerPhone = bookingData.customerPhone || bookingData.address?.phone || bookingData.userId?.phone || "N/A";

    // Build address string from saved address
    const addr = bookingData.address;
    const customerAddress = addr
      ? [addr.houseNo, addr.street, addr.city, addr.pincode].filter(Boolean).join(', ')
      : "Service Address";

    // Worker info - use assigned worker or dummy for demo
    const assignedWorker = bookingData.workerId as any;
    const workerName = assignedWorker?.fullName || (bookingData.status !== 'pending' ? 'Ramesh Kumar (Demo)' : undefined);
    const workerPhone = assignedWorker?.phone || (bookingData.status !== 'pending' ? '+91 98765 43210' : undefined);

    const order = {
      id: bookingData.bookingCode || String(bookingData._id),
      serviceName: bookingData.serviceName || bookingData.serviceCategory || "Home Service",
      subService: bookingData.subService || "General Service",
      status: bookingData.status,
      bookingDate: new Date(bookingData.bookingDate).toLocaleDateString("en-IN"),
      timeSlot: bookingData.timeSlot || "10:00 AM",
      amount: bookingData.amount || 0,
      customerName,
      customerPhone,
      customerAddress,
      workerName,
      workerPhone,
      createdAt: bookingData.createdAt,
      tracking: {
        status: trackingStatus,
        timestamp: timestamp,
        location: trackingStatus === "on_the_way" ? "En route to your location" : undefined,
        estimatedArrival: estimatedArrival,
      },
    };

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

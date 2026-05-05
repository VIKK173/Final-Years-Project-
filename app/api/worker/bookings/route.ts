import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Worker bookings API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Worker bookings API: Database connected successfully");

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      console.log("Worker bookings API: Unauthorized - no worker found");
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }
    console.log("Worker bookings API: Worker authenticated successfully", { workerId: (worker as any)._id });

    const workerId = (worker as any)._id;

    // Fetch all bookings for this worker, sorted by creation date (newest first)
    const bookings = await BookingModel.find({ workerId })
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 })
      .lean();

    console.log("Worker bookings API: Found bookings:", bookings.length);

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking: any) => ({
        id: booking._id,
        bookingCode: booking.bookingCode,
        service: booking.serviceId,
        subService: booking.subService,
        user: booking.userId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail,
        bookingDate: booking.bookingDate,
        completedAt: booking.completedAt,
        amount: booking.amount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        address: booking.address,
        notes: booking.notes,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }))
    });
  } catch (error: unknown) {
    console.error("Worker bookings API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

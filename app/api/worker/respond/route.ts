import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { bookingId, action } = await request.json();

    if (!bookingId || action !== 'accept') {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }

    // Atomic update to accept the job - worker must be assigned this booking
    const updatedBooking = await BookingModel.findOneAndUpdate(
      { 
        _id: bookingId, 
        workerId: worker._id, // Must be assigned to this worker
        status: "pending" 
      },
      { 
        status: "confirmed", // Change to confirmed after acceptance
        acceptedAt: new Date()
      },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json({ 
        error: "Job is no longer available or has already been claimed by another professional." 
      }, { status: 409 }); // 409 Conflict
    }

    console.log(`Worker ${worker.fullName} claimed job ${updatedBooking.bookingCode}`);

    return NextResponse.json({
      success: true,
      message: "Job claimed successfully! Check 'My Bookings' for details.",
      booking: updatedBooking
    });
  } catch (error: unknown) {
    console.error("Worker respond API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

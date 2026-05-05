import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("Worker booking update API: Starting PUT request for booking:", resolvedParams.id);
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Worker booking update API: Database connected successfully");

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      console.log("Worker booking update API: Unauthorized - no worker found");
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }
    console.log("Worker booking update API: Worker authenticated successfully", { workerId: (worker as any)._id });

    const workerId = (worker as any)._id;
    const bookingId = resolvedParams.id;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required" 
      }, { status: 400 });
    }

    // Valid status transitions for workers
    const validStatuses = ["accepted", "confirmed", "on_the_way", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status" 
      }, { status: 400 });
    }

    // Find the booking and verify it belongs to this worker
    const booking = await BookingModel.findOne({ _id: bookingId, workerId });
    if (!booking) {
      return NextResponse.json({ 
        error: "Booking not found or not assigned to you" 
      }, { status: 404 });
    }

    // Update booking status
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { 
        status,
        completedAt: status === "completed" ? new Date() : null
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone')
     .populate('serviceId', 'name category');

    console.log("Worker booking update API: Booking updated successfully", { bookingId, newStatus: status });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking
    });
  } catch (error: unknown) {
    console.error("Worker booking update API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

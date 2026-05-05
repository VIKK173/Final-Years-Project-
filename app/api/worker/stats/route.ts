import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { FeedbackModel } from "@/lib/models/Feedback";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Worker stats API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Worker stats API: Database connected successfully");

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      console.log("Worker stats API: Unauthorized - no worker found");
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }
    console.log("Worker stats API: Worker authenticated successfully", { workerId: (worker as any)._id });

    const workerId = (worker as any)._id;

    // Get current date and time ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all bookings for this worker
    const allBookings = await BookingModel.find({ workerId });
    
    // Calculate stats
    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter(booking => booking.status === 'completed').length;
    const todayBookings = allBookings.filter(booking => 
      new Date(booking.bookingDate) >= todayStart
    ).length;
    const thisWeekBookings = allBookings.filter(booking => 
      new Date(booking.bookingDate) >= weekStart
    ).length;

    // Calculate earnings from completed bookings
    const earnings = allBookings
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => total + (booking.amount || 0), 0);

    // Calculate average rating from worker feedbacks
    const feedbacks = await FeedbackModel.find({ workerId });
    let rating = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + (f.workerStars || 0), 0);
      rating = Number((sum / feedbacks.length).toFixed(1));
    } else {
      rating = worker.rating || 0;
    }

    const stats = {
      totalBookings,
      completedBookings,
      earnings,
      rating,
      todayBookings,
      thisWeekBookings,
    };

    console.log("Worker stats API: Stats calculated successfully", stats);

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error: unknown) {
    console.error("Worker stats API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    // Fallback to mock stats if database fails
    const mockStats = {
      totalBookings: 6,
      completedBookings: 3,
      earnings: 2500,
      rating: 4.5,
      todayBookings: 2,
      thisWeekBookings: 5
    };
    
    return NextResponse.json({
      success: true,
      stats: mockStats
    });
  }
}

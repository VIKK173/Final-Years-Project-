import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Customer bookings API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Customer bookings API: Database connected successfully");

    // Get authenticated user using Clerk
    const { userId } = await auth();
    if (!userId) {
      console.log("Customer bookings API: Unauthorized - no user found");
      return NextResponse.json({ 
        error: "Unauthorized - User authentication required" 
      }, { status: 401 });
    }
    console.log("Customer bookings API: User authenticated successfully", { userId });

    // Fetch bookings for this user - use strictQuery: false to avoid CastError from stale schema cache
    const bookings = await BookingModel.find({ userId })
      .setOptions({ strictQuery: false })
      .populate('userId', 'name email phone')
      .populate('workerId', 'fullName email phone')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 });

    console.log("Customer bookings API: Found bookings:", bookings.length);

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking: any) => ({
        id: booking._id,
        bookingCode: booking.bookingCode,
        user: booking.userId,
        worker: booking.workerId,
        service: booking.serviceId,
        subService: booking.subService,
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
    console.error("Customer bookings API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

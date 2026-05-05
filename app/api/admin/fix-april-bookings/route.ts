import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Fixing April bookings to completed status...");

    // Update recent bookings to completed status for proper earnings
    const result = await BookingModel.updateMany(
      {
        bookingDate: {
          $gte: new Date(2026, 3, 1), // April 1, 2026
          $lte: new Date(2026, 3, 30)  // April 30, 2026
        }
      },
      {
        $set: { 
          status: "completed",
          paymentStatus: "paid"
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} April bookings to completed`);

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} April bookings to completed status`,
      modifiedCount: result.modifiedCount
    });

  } catch (error: unknown) {
    console.error("Fix April bookings error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

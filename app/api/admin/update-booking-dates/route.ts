import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Updating booking dates to recent dates...");

    // Get some existing bookings
    const bookings = await BookingModel.find({}).limit(10);
    
    const today = new Date();
    
    // Update bookings to have recent dates
    for (let i = 0; i < bookings.length; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() - (bookings.length - 1 - i));
      bookingDate.setHours(10, 0, 0, 0);
      
      await BookingModel.updateOne(
        { _id: bookings[i]._id },
        { 
          $set: { 
            bookingDate: bookingDate,
            createdAt: bookingDate
          }
        }
      );
    }

    console.log(`Updated ${bookings.length} bookings to recent dates`);

    return NextResponse.json({
      success: true,
      message: `Updated ${bookings.length} bookings to recent dates`,
      bookingsUpdated: bookings.length
    });

  } catch (error: unknown) {
    console.error("Update booking dates error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

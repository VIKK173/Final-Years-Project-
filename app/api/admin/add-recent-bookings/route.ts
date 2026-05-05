import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";
import { ServiceModel } from "@/lib/models/Service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Creating recent test bookings...");

    // Get services
    const services = await ServiceModel.find({});
    if (services.length === 0) {
      return NextResponse.json({ error: "No services found" }, { status: 400 });
    }

    // Create recent bookings for last few days
    const recentBookings = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() - (6 - i));
      bookingDate.setHours(10, 0, 0, 0);
      
      const service = services[i % services.length];
      const subService = {
        name: `Test Service ${i + 1}`,
        price: 500 + (i * 100)
      };
      
      const booking = {
        bookingCode: `SH${2000 + i}`,
        userId: "test-user-id",
        serviceId: service._id,
        subService: subService.name,
        amount: subService.price,
        status: i < 5 ? "completed" : "pending",
        paymentStatus: i < 5 ? "paid" : "pending",
        bookingDate: bookingDate,
        createdAt: bookingDate,
        address: {
          houseNo: "123",
          street: "Test Street",
          city: "Test City",
          state: "Test State",
          pincode: "123456"
        },
        notes: `Recent test booking ${i + 1}`
      };
      
      recentBookings.push(booking);
    }

    await BookingModel.insertMany(recentBookings);

    console.log(`Created ${recentBookings.length} recent bookings`);

    return NextResponse.json({
      success: true,
      message: `Created ${recentBookings.length} recent bookings`,
      bookingsCreated: recentBookings.length
    });

  } catch (error: unknown) {
    console.error("Create recent bookings error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

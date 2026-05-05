import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { ServiceModel } from "@/lib/models/Service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Adding today's bookings...");

    // Get today's date
    const today = new Date();
    today.setHours(10, 0, 0, 0); // Set to 10 AM today

    // Find or create a service
    let service = await ServiceModel.findOne({ name: "Plumbing" });
    if (!service) {
      service = new ServiceModel({
        name: "Plumbing",
        slug: "plumbing",
        category: "plumbing",
        description: "Professional plumbing services",
        basePrice: 800,
        isActive: true
      });
      await service.save();
    }

    // Find a worker
    const worker = await WorkerModel.findOne({ category: "plumbing" });
    if (!worker) {
      return NextResponse.json({ error: "No plumbing worker found" }, { status: 404 });
    }

    // Create today's booking
    const todayBooking = new BookingModel({
      userId: "customer_today_001",
      workerId: worker._id,
      serviceId: service._id,
      bookingCode: `SH${Date.now().toString().slice(-6)}`,
      subService: "Kitchen Sink Repair",
      bookingDate: today, // Today's date
      createdAt: new Date(),
      amount: 800,
      status: "pending",
      paymentStatus: "pending",
      address: {
        houseNo: "123",
        street: "Main Street",
        city: "Ranchi",
        state: "Jharkhand",
        pincode: "834001"
      },
      notes: "Kitchen sink is leaking, needs immediate repair"
    });

    await todayBooking.save();

    // Create another booking for today (different time)
    const afternoonBooking = new BookingModel({
      userId: "customer_today_002",
      workerId: worker._id,
      serviceId: service._id,
      bookingCode: `SH${(Date.now() + 1000).toString().slice(-6)}`,
      subService: "Bathroom Pipe Installation",
      bookingDate: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      createdAt: new Date(),
      amount: 1200,
      status: "confirmed",
      paymentStatus: "pending",
      address: {
        houseNo: "456",
        street: "Park Road",
        city: "Ranchi",
        state: "Jharkhand",
        pincode: "834002"
      },
      notes: "Need new bathroom pipes installed"
    });

    await afternoonBooking.save();

    console.log("Today's bookings added successfully");

    return NextResponse.json({
      success: true,
      message: "Today's bookings added successfully",
      bookings: [
        {
          id: todayBooking._id,
          code: todayBooking.bookingCode,
          date: todayBooking.bookingDate,
          service: "Kitchen Sink Repair",
          amount: 800,
          status: "pending"
        },
        {
          id: afternoonBooking._id,
          code: afternoonBooking.bookingCode,
          date: afternoonBooking.bookingDate,
          service: "Bathroom Pipe Installation",
          amount: 1200,
          status: "confirmed"
        }
      ]
    });

  } catch (error: unknown) {
    console.error("Add today's bookings error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

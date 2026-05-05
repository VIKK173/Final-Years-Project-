import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";
import { ServiceModel } from "@/lib/models/Service";
import { UserModel } from "@/lib/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Checking database data...");

    // Check counts
    const bookingCount = await BookingModel.countDocuments();
    const serviceCount = await ServiceModel.countDocuments();
    const userCount = await UserModel.countDocuments();

    console.log(`Bookings: ${bookingCount}, Services: ${serviceCount}, Users: ${userCount}`);

    // Get sample bookings
    const bookings = await BookingModel.find({}).limit(5).lean();
    console.log("Sample bookings:", bookings);

    // Get sample services
    const services = await ServiceModel.find({}).limit(3).lean();
    console.log("Sample services:", services);

    return NextResponse.json({
      success: true,
      counts: {
        bookings: bookingCount,
        services: serviceCount,
        users: userCount
      },
      sampleBookings: bookings,
      sampleServices: services
    });

  } catch (error: unknown) {
    console.error("Test data error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Creating test data...");

    // Get or create services
    let services = await ServiceModel.find({});
    if (services.length === 0) {
      // Create default services
      services = await ServiceModel.insertMany([
        {
          name: "Plumbing",
          category: "Home Services",
          subServices: [
            { name: "Kitchen Sink Repair", price: 500 },
            { name: "Bathroom Pipe Fitting", price: 800 }
          ]
        },
        {
          name: "Electrical",
          category: "Home Services", 
          subServices: [
            { name: "Electrical Wiring", price: 1000 },
            { name: "Fan Installation", price: 600 }
          ]
        }
      ]);
    }

    // Create test bookings
    const testBookings = [];
    for (let i = 0; i < 10; i++) {
      const service = services[i % services.length];
      const subService = service.subServices[0];
      
      const booking = {
        bookingCode: `SH${1000 + i}`,
        userId: "test-user-id",
        serviceId: service._id,
        subService: subService.name,
        amount: subService.price,
        status: i < 7 ? "completed" : "pending",
        paymentStatus: i < 7 ? "paid" : "pending",
        bookingDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Last 10 days
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        address: {
          houseNo: "123",
          street: "Test Street",
          city: "Test City",
          state: "Test State",
          pincode: "123456"
        }
      };
      
      testBookings.push(booking);
    }

    await BookingModel.insertMany(testBookings);

    console.log(`Created ${testBookings.length} test bookings`);

    return NextResponse.json({
      success: true,
      message: `Created ${testBookings.length} test bookings`,
      bookingsCreated: testBookings.length
    });

  } catch (error: unknown) {
    console.error("Create test data error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

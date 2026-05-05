import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { ServiceModel } from "@/lib/models/Service";
import { WorkerModel } from "@/lib/models/Worker";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { auth } from "@clerk/nextjs/server";
import { sendSMS } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Bookings API: Starting POST request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Bookings API: Database connected successfully");

    // Get authenticated user using Clerk
    const { userId } = await auth();
    if (!userId) {
      console.log("Bookings API: Unauthorized - no user found");
      return NextResponse.json({ 
        error: "Unauthorized - User authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      userEmail,
      userName,
      serviceName,
      serviceCategory,
      subService,
      amount,
      bookingDate,
      timeSlot,
      address,
      notes
    } = body;

    // Validate required fields
    if (!serviceName || !subService || !amount || !bookingDate) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Find or create service
    let service = await ServiceModel.findOne({ 
      $or: [
        { name: serviceName },
        { slug: serviceName.toLowerCase().replace(/\s+/g, '-') }
      ]
    });
    if (!service) {
      console.log("Bookings API: Service not found, creating:", serviceName);
      
      service = new ServiceModel({
        name: serviceName,
        slug: serviceName.toLowerCase().replace(/\s+/g, '-'),
        category: serviceCategory || 'general',
        description: `${serviceName} service`,
        basePrice: amount || 500,
        isActive: true
      });
      
      await service.save();
      console.log("Bookings API: Created new service:", service.name);
    }

    // Generate unique booking code
    const bookingCode = `SH${Date.now().toString().slice(-6)}`;

    // Robust date parsing
    let parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      // Try parsing common formats manually if Date fails (e.g. DD/MM/YYYY)
      const parts = bookingDate.split(/[\/\-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) { // YYYY-MM-DD
          parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else { // DD/MM/YYYY
          parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
    }

    if (isNaN(parsedDate.getTime())) {
      console.error("Bookings API: Invalid date format received:", bookingDate);
      return NextResponse.json({ error: "Invalid booking date format" }, { status: 400 });
    }

    // Create the booking without immediate worker assignment (Job Board style)
    const booking = new BookingModel({
      userId: userId,
      workerId: null, // No worker assigned yet
      serviceId: service._id,
      serviceCategory: serviceCategory || service.category || 'general',
      bookingCode: bookingCode,
      subService: subService,
      bookingDate: parsedDate,
      amount: amount,
      status: "pending", 
      paymentStatus: "pending",
      address: {
        houseNo: address.flat || "",
        street: address.area || "",
        city: address.city || "",
        state: "Jharkhand", // Default state
        pincode: address.pin || "",
        phone: address.phone || "" // Save verified phone number
      },
      customerName: userName || 'Customer', // Save customer name
      customerPhone: address.phone || '', // Save customer phone
      customerEmail: userEmail || '', // Save customer email
      notes: notes || ""
    });

    try {
      await booking.save();
      console.log("Bookings API: Booking created successfully. Awaiting worker acceptance.", { bookingCode });
    } catch (saveError: any) {
      console.error("Bookings API: Mongoose save error:", {
        message: saveError.message,
        errors: saveError.errors,
        stack: saveError.stack
      });
      throw saveError; // Re-throw to be caught by the outer catch block
    }

    // Send confirmation SMS via Twilio
    if (address.phone) {
      const smsBody = `Success! Your booking for ${serviceName} (${subService}) is confirmed. Code: ${bookingCode}. Our professional will arrive on ${parsedDate.toLocaleDateString('en-IN')} at ${timeSlot}.`;
      await sendSMS(address.phone, smsBody);
    }

    // Populate the booking with user and worker details for response
    const populatedBooking = await BookingModel.findById(booking._id)
      .populate('serviceId', 'name category');

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking
    });

  } catch (error: unknown) {
    console.error("Bookings API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Bookings API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Bookings API: Database connected successfully");

    const bookings = await BookingModel.find({})
      .populate('userId', 'name email phone')
      .populate('workerId', 'fullName email phone')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 });

    console.log("Bookings API: Found bookings:", bookings.length);

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
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
    console.error("Bookings API: Unexpected error in GET:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

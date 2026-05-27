import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedWorker } from "@/lib/worker-auth";

export const dynamic = "force-dynamic";

// GET - Get pending notifications for worker
export async function GET(request: NextRequest) {
  try {
    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ error: "Unauthorized - Worker authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();

    // Get pending bookings assigned to this worker
    const workerData = worker as any;
    const pendingBookings = await BookingModel.find({
      workerId: workerData._id,
      status: "pending"
    })
    .populate('userId', 'fullName phone email')
    .populate('serviceId', 'name category')
    .sort({ createdAt: -1 });

    const notifications = pendingBookings.map((booking: any) => ({
      id: booking._id,
      type: 'new_booking',
      title: 'New Service Request',
      message: `New ${booking.serviceId?.name || 'service'} request from ${booking.customerName || 'Customer'}`,
      bookingCode: booking.bookingCode,
      amount: booking.amount,
      service: booking.serviceId?.name || 'Service',
      customer: {
        name: booking.customerName || 'Customer',
        phone: booking.customerPhone || booking.address?.phone || 'N/A',
        email: booking.customerEmail || 'N/A'
      },
      address: booking.address,
      createdAt: booking.createdAt,
      urgency: 'high', // New bookings are high priority
      actionRequired: true
    }));

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.length
    });

  } catch (error: unknown) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ error: "Unauthorized - Worker authentication required" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    await connectToDatabase();
    await ensureDatabaseCollections();

    // Mark booking as viewed (you could add a viewedAt field to booking schema)
    await BookingModel.findByIdAndUpdate(notificationId, {
      viewedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error: unknown) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

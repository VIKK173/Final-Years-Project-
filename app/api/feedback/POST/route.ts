import { NextRequest, NextResponse } from "next/server";
import { FeedbackModel } from "@/lib/models/Feedback";
import { UserModel } from "@/lib/models/User";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      userName,
      serviceName,
      serviceStars,
      workerStars,
      comment,
      tags,
      bookingId
    } = await request.json();

    // Validation
    if (!userName || !serviceName || !comment) {
      return NextResponse.json({ 
        error: "Customer name, service name, and comment are required" 
      }, { status: 400 });
    }

    if (!serviceStars || serviceStars < 1 || serviceStars > 5) {
      return NextResponse.json({ 
        error: "Service rating must be between 1 and 5" 
      }, { status: 400 });
    }

    if (!workerStars || workerStars < 1 || workerStars > 5) {
      return NextResponse.json({ 
        error: "Worker rating must be between 1 and 5" 
      }, { status: 400 });
    }

    // Find or create user
    let user = await UserModel.findOne({ fullName: userName });
    if (!user) {
      user = await UserModel.create({
        fullName: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@feedback.local`,
        password: "feedback123",
      });
    }

    // Find or create worker
    let worker = await WorkerModel.findOne({ fullName: "Test Worker" });
    if (!worker) {
      worker = await WorkerModel.create({
        fullName: "Test Worker",
        email: `testworker_${Date.now()}@servicehub.local`,
        password: "worker123",
        category: serviceName,
        rating: 4.5,
        totalJobs: 0,
        isAvailable: true,
        dutyStatus: "available",
        photoUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=200&q=80",
        experienceYears: 2,
      });
    }

    // Create or find booking
    let booking = null;
    if (bookingId) {
      booking = await BookingModel.findById(bookingId);
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
    } else {
      // Create a mock booking for this feedback
      booking = await BookingModel.create({
        userId: user._id,
        workerId: worker._id,
        serviceName,
        amount: Math.floor(Math.random() * 3000) + 500,
        status: "completed",
        bookingDate: new Date(),
        completedAt: new Date(),
        subService: "Standard Service"
      });
    }

    // Create feedback
    const feedback = await FeedbackModel.create({
      bookingId: booking._id,
      userId: user._id,
      workerId: worker._id,
      serviceStars,
      workerStars,
      comment,
      tags: tags || [],
      isFlagged: false,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback added successfully",
      feedback: {
        id: feedback._id,
        userName,
        serviceName,
        serviceStars,
        workerStars,
        comment,
        tags,
        bookingId: booking._id.toString()
      }
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

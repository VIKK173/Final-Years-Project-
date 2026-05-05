import { NextRequest, NextResponse } from "next/server";
import { FeedbackModel } from "@/lib/models/Feedback";
import { UserModel } from "@/lib/models/User";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 10);
    const workerId = searchParams.get("workerId");

    const query: any = {};
    if (workerId) {
      // Safely convert string to ObjectId to avoid Mongoose CastError
      if (mongoose.Types.ObjectId.isValid(workerId)) {
        query.workerId = new mongoose.Types.ObjectId(workerId);
      } else {
        // Invalid workerId format - return empty
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const recentFeedback = await FeedbackModel.find(query)
      .populate({
        path: "bookingId",
        model: BookingModel,
        select: "serviceName amount _id",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formattedFeedback = recentFeedback.map((feedback) => ({
      id: feedback._id,
      bookingId: (feedback.bookingId as any)?._id?.toString() || "",
      userName: feedback.userName || "Anonymous",
      serviceName: (feedback.bookingId as any)?.serviceName || "Unknown Service",
      serviceStars: feedback.serviceStars,
      workerStars: feedback.workerStars,
      comment: feedback.comment,
      tags: feedback.tags,
      createdAt: feedback.createdAt,
      amount: (feedback.bookingId as any)?.amount || 0,
      adminReply: feedback.adminReply || "",
      isFlagged: feedback.isFlagged || false,
    }));

    return NextResponse.json({
      success: true,
      data: formattedFeedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch feedback",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    // Get authenticated user
    const { userId } = await auth();

    const {
      bookingId,
      serviceStars,
      workerStars,
      comment,
      tags
    } = await request.json();

    // Validation
    if (!bookingId) {
      return NextResponse.json({ 
        success: false,
        error: "Booking ID is required" 
      }, { status: 400 });
    }

    if (!serviceStars || serviceStars < 1 || serviceStars > 5) {
      return NextResponse.json({ 
        success: false,
        error: "Service rating must be between 1 and 5" 
      }, { status: 400 });
    }

    if (!workerStars || workerStars < 1 || workerStars > 5) {
      return NextResponse.json({ 
        success: false,
        error: "Worker rating must be between 1 and 5" 
      }, { status: 400 });
    }

    // Find booking by _id or bookingCode
    let booking = null;
    try {
      booking = await BookingModel.findById(bookingId);
    } catch (e) {
      // bookingId might not be a valid ObjectId, try bookingCode
    }
    if (!booking) {
      booking = await BookingModel.findOne({ 
        $or: [
          { bookingCode: bookingId },
          { bookingCode: `#${bookingId}` }
        ]
      });
    }
    if (!booking) {
      return NextResponse.json({ 
        success: false,
        error: "Booking not found. Please try again." 
      }, { status: 404 });
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await FeedbackModel.findOne({ bookingId: booking._id });
    if (existingFeedback) {
      // Already submitted - just return success so UI doesn't break
      return NextResponse.json({ 
        success: true,
        message: "Feedback already submitted for this booking"
      });
    }

    // Create feedback with safe defaults
    const feedback = await FeedbackModel.create({
      bookingId: booking._id,
      userId: booking.userId || userId || "anonymous",
      userName: booking.customerName || "Customer",
      workerId: booking.workerId || null,
      serviceId: booking.serviceId || null,
      serviceStars,
      workerStars,
      comment: (comment || "").trim(),
      tags: tags || [],
      isFlagged: serviceStars < 3 || workerStars < 3,
    });

    console.log("Feedback created:", { feedbackId: feedback._id, bookingId: booking._id });

    // Update booking status
    await BookingModel.findByIdAndUpdate(bookingId, {
      $set: { hasFeedback: true }
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback._id,
        serviceStars,
        workerStars,
        comment,
        tags: tags || []
      }
    });

  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit feedback",
      },
      { status: 500 }
    );
  }
}

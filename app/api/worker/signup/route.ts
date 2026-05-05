import { NextResponse } from "next/server";
import { WorkerModel } from "@/lib/models/Worker";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const { name, email, phone, password, serviceType, location } = await request.json();

    // Validation
    if (!name || !email || !phone || !password || !serviceType || !location) {
      return NextResponse.json({ 
        error: "All fields are required" 
      }, { status: 400 });
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 });
    }

    // Phone validation
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ 
        error: "Phone must be 10 digits" 
      }, { status: 400 });
    }

    // Check if worker already exists
    const existingWorker = await WorkerModel.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingWorker) {
      return NextResponse.json({ 
        error: "Worker with this email or phone already exists" 
      }, { status: 409 });
    }

    // Create new worker with PENDING status
    const worker = await WorkerModel.create({
      fullName: name,
      email,
      phone,
      password, // In production, you should hash this
      category: serviceType,
      city: location,
      status: "pending", // IMPORTANT: Workers start as pending
      rating: 0,
      totalJobs: 0,
      isAvailable: true,
      dutyStatus: "available",
      experienceYears: 0,
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=brand`,
    });

    console.log("Worker registered successfully with pending status", {
      workerId: worker._id,
      email: worker.email,
      status: worker.status
    });

    return NextResponse.json({
      success: true,
      message: "Worker registration successful! Your account is pending admin approval. Please wait for admin to approve your registration before you can login.",
      worker: {
        id: worker._id,
        name: worker.fullName,
        email: worker.email,
        serviceType: worker.category,
        location: worker.city,
        status: worker.status
      },
      nextSteps: [
        "Wait for admin approval",
        "Admin will review your application",
        "You will be able to login once approved",
        "Check your email for approval notification"
      ]
    });
  } catch (error) {
    console.error("Worker signup error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { WorkerModel } from "@/lib/models/Worker";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Worker registration: Starting registration process");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Worker registration: Database connected successfully");

    const { name, email, phone, password, serviceCategory, city, profilePhoto } = await request.json();

    console.log("Worker registration: Request data received", { 
      name, 
      email, 
      phone, 
      serviceCategory, 
      city,
      hasPassword: !!password,
      hasProfilePhoto: !!profilePhoto 
    });

    // Validation
    if (!name || !email || !phone || !password || !serviceCategory || !city) {
      console.log("Worker registration: Validation failed - missing fields");
      return NextResponse.json({ 
        error: "All fields are required: name, email, phone, password, service category, and city" 
      }, { status: 400 });
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log("Worker registration: Validation failed - invalid email format");
      return NextResponse.json({ 
        error: "Invalid email format" 
      }, { status: 400 });
    }

    // Phone validation (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      console.log("Worker registration: Validation failed - invalid phone format");
      return NextResponse.json({ 
        error: "Phone must be 10 digits" 
      }, { status: 400 });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      console.log("Worker registration: Validation failed - password too short");
      return NextResponse.json({ 
        error: "Password must be at least 6 characters long" 
      }, { status: 400 });
    }

    // Check if worker already exists
    let existingWorker;
    try {
      existingWorker = await WorkerModel.findOne({ 
        $or: [{ email }, { phone }] 
      });
    } catch (dbError) {
      console.error("Worker registration: Database error checking existing worker:", dbError);
      return NextResponse.json({ 
        error: "Database error occurred while checking existing worker" 
      }, { status: 500 });
    }

    if (existingWorker) {
      console.log("Worker registration: Worker already exists", { 
        existingEmail: existingWorker.email === email,
        existingPhone: existingWorker.phone === phone 
      });
      return NextResponse.json({ 
        error: "Worker with this email or phone already exists" 
      }, { status: 409 });
    }

    // Create new worker with PENDING status
    let newWorker;
    try {
      newWorker = await WorkerModel.create({
        fullName: name,
        email: email.toLowerCase(),
        password: password, // In production, hash this password
        phone,
        category: serviceCategory,
        city,
        photoUrl: profilePhoto || "",
        status: "pending", // IMPORTANT: Workers start as pending
        rating: 4.5,
        totalJobs: 0,
        isAvailable: true,
        dutyStatus: "available",
        experienceYears: 0,
      });
      console.log("Worker registration: Worker created successfully", { 
        workerId: newWorker._id,
        status: newWorker.status 
      });
    } catch (createError) {
      console.error("Worker registration: Error creating worker:", createError);
      return NextResponse.json({ 
        error: "Database error occurred while creating worker" 
      }, { status: 500 });
    }

    console.log("Worker registration: Registration completed successfully");

    return NextResponse.json({
      success: true,
      message: "Worker registration successful! Your account is pending admin approval. You will be able to login once approved by the admin.",
      worker: {
        id: newWorker._id,
        fullName: newWorker.fullName,
        email: newWorker.email,
        phone: newWorker.phone,
        category: newWorker.category,
        city: newWorker.city,
        status: newWorker.status,
        createdAt: newWorker.createdAt
      },
      nextSteps: [
        "Wait for admin approval",
        "Check your email for approval notification",
        "Once approved, you can login to your worker dashboard",
        "Admin will review your application within 24-48 hours"
      ]
    });

  } catch (error: unknown) {
    console.error("Worker registration: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error during registration",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

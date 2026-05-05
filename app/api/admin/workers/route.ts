import { NextResponse } from "next/server";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Admin workers API: Starting GET request");
    
    // Connect to database
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Admin workers API: Database connected successfully");

    // Check admin authentication
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      console.log("Admin workers API: Unauthorized - no admin found");
      return NextResponse.json({ 
        error: "Unauthorized - Admin authentication required. Please login as admin." 
      }, { status: 401 });
    }
    console.log("Admin workers API: Admin authenticated successfully", { adminId: admin._id, email: admin.email });

    // Fetch workers with better error handling
    let workers;
    try {
      workers = await WorkerModel.find({})
        .sort({ createdAt: -1 })
        .lean();
      console.log("Admin workers API: Workers fetched successfully", { count: workers.length });
      
      // Log worker details for debugging
      if (workers.length > 0) {
        console.log("Admin workers API: Sample worker data", {
          firstWorker: {
            _id: workers[0]._id,
            fullName: workers[0].fullName,
            email: workers[0].email,
            status: workers[0].status
          }
        });
      } else {
        console.log("Admin workers API: No workers found in database");
      }
    } catch (dbError) {
      console.error("Admin workers API: Database error fetching workers:", dbError);
      return NextResponse.json({ 
        error: "Database error occurred while fetching workers: " + (dbError instanceof Error ? dbError.message : "Unknown error")
      }, { status: 500 });
    }

    // Transform worker data with safe access
    const transformedWorkers = workers.map(worker => {
      try {
        return {
          _id: worker._id?.toString() || "unknown-id",
          fullName: worker.fullName || "Unknown",
          email: worker.email || "no-email@example.com",
          phone: worker.phone || "Not provided",
          category: worker.category || "Not specified",
          city: worker.city || "Not specified",
          status: worker.status || "pending",
          avgRating: worker.rating || 0,
          totalJobs: worker.totalJobs || 0,
          isAvailable: worker.isAvailable !== undefined ? worker.isAvailable : true,
          dutyStatus: worker.dutyStatus || "available",
          photoUrl: worker.photoUrl || "",
          createdAt: worker.createdAt || new Date().toISOString()
        };
      } catch (transformError) {
        console.error("Admin workers API: Error transforming worker data:", transformError);
        return {
          _id: "error-transforming",
          fullName: "Error",
          email: "error@example.com",
          phone: "Error",
          category: "Error",
          city: "Error",
          status: "error",
          avgRating: 0,
          totalJobs: 0,
          isAvailable: false,
          dutyStatus: "error",
          photoUrl: "",
          createdAt: new Date().toISOString()
        };
      }
    });

    console.log("Admin workers API: Workers transformed successfully", { 
      transformedCount: transformedWorkers.length,
      sampleTransformed: transformedWorkers[0] 
    });

    return NextResponse.json({
      success: true,
      workers: transformedWorkers,
      message: `Found ${transformedWorkers.length} workers`
    });
  } catch (error: unknown) {
    console.error("Admin workers API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, specialization, city } = await request.json();

    if (!name || !phone || !specialization || !city) {
      return NextResponse.json({ 
        error: "Name, phone, specialization, and city are required" 
      }, { status: 400 });
    }

    // Create worker with pending status
    const worker = await WorkerModel.create({
      fullName: name,
      email: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@servicehub.local`,
      password: "worker123",
      phone,
      category: specialization,
      city,
      status: "pending",
      rating: 4.5,
      totalJobs: 0,
      isAvailable: true,
      dutyStatus: "available",
      photoUrl: "",
      experienceYears: 1,
    });

    return NextResponse.json({
      success: true,
      message: "Worker added successfully",
      worker: {
        _id: worker._id,
        fullName: worker.fullName,
        email: worker.email,
        status: worker.status
      }
    });
  } catch (error: unknown) {
    console.error("Error creating worker:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workerId, dutyStatus } = await request.json();

    if (!workerId || !["available", "busy", "off_duty"].includes(dutyStatus)) {
      return NextResponse.json({ 
        error: "Valid workerId and dutyStatus are required" 
      }, { status: 400 });
    }

    const worker = await WorkerModel.findByIdAndUpdate(
      workerId,
      {
        dutyStatus,
        isAvailable: dutyStatus === "available",
      },
      { new: true }
    );

    if (!worker) {
      return NextResponse.json({ 
        error: "Worker not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${worker.fullName} marked ${dutyStatus.replace("_", " ")}`,
      worker: {
        _id: worker._id,
        fullName: worker.fullName,
        dutyStatus: worker.dutyStatus,
        isAvailable: worker.isAvailable
      }
    });
  } catch (error: unknown) {
    console.error("Error updating worker duty status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

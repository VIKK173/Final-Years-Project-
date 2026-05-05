import { NextResponse } from "next/server";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Worker profile API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Worker profile API: Database connected successfully");

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      console.log("Worker profile API: Unauthorized - no worker found");
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }
    console.log("Worker profile API: Worker authenticated successfully", { workerId: worker._id });

    // Return worker profile data
    return NextResponse.json({
      success: true,
      worker: {
        id: worker._id,
        name: worker.fullName,
        email: worker.email,
        phone: worker.phone,
        serviceType: worker.category,
        location: worker.city,
        rating: worker.rating || 0,
        totalJobs: worker.totalJobs || 0,
        isAvailable: worker.isAvailable !== undefined ? worker.isAvailable : true,
        dutyStatus: worker.dutyStatus || "available",
        photoUrl: worker.photoUrl || "",
        experience: worker.experienceYears || 0,
        createdAt: worker.createdAt
      }
    });
  } catch (error: unknown) {
    console.error("Worker profile API: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }

    const { name, phone, serviceType, location, isAvailable } = await request.json();

    // Update worker profile
    const updatedWorker = await WorkerModel.findByIdAndUpdate(
      worker._id,
      {
        fullName: name || worker.fullName,
        phone: phone || worker.phone,
        category: serviceType || worker.category,
        city: location || worker.city,
        isAvailable: isAvailable !== undefined ? isAvailable : worker.isAvailable,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      worker: {
        id: updatedWorker._id,
        name: updatedWorker.fullName,
        email: updatedWorker.email,
        phone: updatedWorker.phone,
        serviceType: updatedWorker.category,
        location: updatedWorker.city,
        isAvailable: updatedWorker.isAvailable
      }
    });
  } catch (error: unknown) {
    console.error("Worker profile update error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

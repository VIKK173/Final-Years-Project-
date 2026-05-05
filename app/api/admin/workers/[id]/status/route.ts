import { NextResponse } from "next/server";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Admin worker status update: Starting status update");
    
    // Connect to database
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Admin worker status update: Database connected successfully");

    // Check admin authentication
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      console.log("Admin worker status update: Unauthorized - no admin found");
      return NextResponse.json({ 
        error: "Unauthorized - Admin authentication required. Please login as admin." 
      }, { status: 401 });
    }
    console.log("Admin worker status update: Admin authenticated successfully", { adminId: admin._id });

    // Parse request body and get worker ID
    const { status } = await request.json();
    const { id: workerId } = await params; // Fix: await params
    
    console.log("Admin worker status update: Request received", { workerId, newStatus: status });

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      console.log("Admin worker status update: Invalid status provided", { status });
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: pending, approved, rejected, suspended" 
      }, { status: 400 });
    }

    // Find worker first to check if exists
    let existingWorker;
    try {
      existingWorker = await WorkerModel.findById(workerId);
      if (!existingWorker) {
        console.log("Admin worker status update: Worker not found", { workerId });
        return NextResponse.json({ 
          error: "Worker not found" 
        }, { status: 404 });
      }
      console.log("Admin worker status update: Worker found", { 
        workerId: existingWorker._id, 
        currentStatus: existingWorker.status,
        workerName: existingWorker.fullName 
      });
    } catch (dbError) {
      console.error("Admin worker status update: Database error finding worker:", dbError);
      return NextResponse.json({ 
        error: "Database error occurred while finding worker" 
      }, { status: 500 });
    }

    // Update worker status
    let updatedWorker;
    try {
      console.log("Attempting to update worker status in MongoDB...");
      
      updatedWorker = await WorkerModel.findByIdAndUpdate(
        workerId,
        { 
          status,
          updatedAt: new Date() // Explicitly set updated time
        },
        { 
          new: true, // Return the updated document
          runValidators: true // Run schema validators
        }
      );
      
      console.log("MongoDB update completed, checking result...");
      
      if (!updatedWorker) {
        console.error("MongoDB update returned null");
        throw new Error("Worker update failed - no document returned");
      }
      
      console.log("Worker status updated successfully in MongoDB", {
        workerId: updatedWorker._id,
        oldStatus: existingWorker.status,
        newStatus: updatedWorker.status,
        workerName: updatedWorker.fullName,
        updatedAt: updatedWorker.updatedAt
      });
      
      // Double-check the update by fetching fresh from database
      const verificationWorker = await WorkerModel.findById(workerId);
      console.log("Verification check - fresh data from MongoDB:", {
        id: verificationWorker?._id,
        status: verificationWorker?.status,
        updatedAt: verificationWorker?.updatedAt
      });
      
      if (verificationWorker?.status !== status) {
        console.error("CRITICAL: Status update verification failed!");
        console.error("Expected:", status);
        console.error("Actual:", verificationWorker?.status);
        throw new Error("Status update verification failed - database not updated correctly");
      }
      
    } catch (updateError) {
      console.error("Admin worker status update: Database error updating worker:", updateError);
      return NextResponse.json({ 
        error: "Database error occurred while updating worker status: " + (updateError instanceof Error ? updateError.message : "Unknown error")
      }, { status: 500 });
    }

    // Verify the update was successful
    if (updatedWorker.status !== status) {
      console.error("Admin worker status update: Status update verification failed", {
        expectedStatus: status,
        actualStatus: updatedWorker.status
      });
      return NextResponse.json({ 
        error: "Status update verification failed" 
      }, { status: 500 });
    }

    console.log("Admin worker status update: Status update completed successfully");

    return NextResponse.json({
      success: true,
      message: `Worker status updated to ${status}`,
      worker: {
        id: updatedWorker._id,
        fullName: updatedWorker.fullName,
        email: updatedWorker.email,
        status: updatedWorker.status,
        updatedAt: updatedWorker.updatedAt
      }
    });

  } catch (error: unknown) {
    console.error("Admin worker status update: Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

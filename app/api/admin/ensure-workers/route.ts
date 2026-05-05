import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { WorkerModel } from "@/lib/models/Worker";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    console.log("Ensuring real worker data exists...");

    // Check if workers exist
    const existingWorkers = await WorkerModel.find({});
    console.log(`Found ${existingWorkers.length} existing workers`);

    if (existingWorkers.length === 0) {
      // Create real workers with different categories
      const workers = [
        {
          fullName: "Rajesh Kumar",
          email: "rajesh.kumar@example.com",
          phone: "+91 9876543210",
          category: "plumbing",
          serviceCategories: ["plumbing", "general"],
          city: "Ranchi",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isOnline: true,
          isAvailable: true,
          status: "approved",
          currentJobs: 0,
          rating: 4.5,
          totalCompletedJobs: 25,
          experience: "5 years",
          description: "Expert plumber with 5+ years of experience"
        },
        {
          fullName: "Amit Singh",
          email: "amit.singh@example.com",
          phone: "+91 9876543211",
          category: "electrical",
          serviceCategories: ["electrical", "general"],
          city: "Ranchi",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isOnline: true,
          isAvailable: true,
          status: "approved",
          currentJobs: 0,
          rating: 4.8,
          totalCompletedJobs: 30,
          experience: "7 years",
          description: "Professional electrician specializing in home and office wiring"
        },
        {
          fullName: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "+91 9876543212",
          category: "cleaning",
          serviceCategories: ["cleaning", "general"],
          city: "Ranchi",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isOnline: true,
          isAvailable: true,
          status: "approved",
          currentJobs: 0,
          rating: 4.6,
          totalCompletedJobs: 18,
          experience: "3 years",
          description: "Professional cleaning services for residential and commercial spaces"
        },
        {
          fullName: "Vikram Rao",
          email: "vikram.rao@example.com",
          phone: "+91 9876543213",
          category: "ac",
          serviceCategories: ["ac", "electrical", "general"],
          city: "Ranchi",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isOnline: true,
          isAvailable: true,
          status: "approved",
          currentJobs: 0,
          rating: 4.7,
          totalCompletedJobs: 22,
          experience: "6 years",
          description: "AC repair and maintenance specialist"
        },
        {
          fullName: "Sunita Devi",
          email: "sunita.devi@example.com",
          phone: "+91 9876543214",
          category: "carpentry",
          serviceCategories: ["carpentry", "general"],
          city: "Ranchi",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isOnline: false,
          isAvailable: false,
          status: "approved",
          currentJobs: 0,
          rating: 4.4,
          totalCompletedJobs: 15,
          experience: "4 years",
          description: "Skilled carpenter for furniture and woodwork"
        }
      ];

      await WorkerModel.insertMany(workers);
      console.log(`Created ${workers.length} real workers`);
    }

    // Update existing workers to ensure they have required fields
    await WorkerModel.updateMany(
      {},
      {
        $set: {
          isActive: true,
          isOnline: true,
          isAvailable: true,
          currentJobs: 0,
          serviceCategories: ["general"]
        }
      }
    );

    const finalWorkers = await WorkerModel.find({});
    console.log(`Total workers after update: ${finalWorkers.length}`);

    return NextResponse.json({
      success: true,
      message: "Real worker data ensured successfully",
      workersCount: finalWorkers.length,
      workers: finalWorkers.map(w => ({
        id: w._id,
        name: w.fullName,
        category: w.category,
        rating: w.rating,
        isOnline: w.isOnline,
        currentJobs: w.currentJobs
      }))
    });

  } catch (error: unknown) {
    console.error("Ensure workers error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

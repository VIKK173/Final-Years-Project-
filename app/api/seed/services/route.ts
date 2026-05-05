import { NextResponse } from "next/server";
import { ServiceModel } from "@/lib/models/Service";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

const DEFAULT_SERVICES = [
  {
    name: "Plumbing",
    slug: "plumbing",
    category: "plumbing",
    description: "Professional plumbing services for homes and offices",
    basePrice: 500,
    isActive: true
  },
  {
    name: "Electrical",
    slug: "electrical",
    category: "electrical",
    description: "Expert electrical installation and repair services",
    basePrice: 800,
    isActive: true
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    category: "cleaning",
    description: "Thorough cleaning services for residential properties",
    basePrice: 300,
    isActive: true
  },
  {
    name: "AC Service",
    slug: "ac-service",
    category: "ac-service",
    description: "Air conditioning installation and maintenance",
    basePrice: 600,
    isActive: true
  },
  {
    name: "Carpentry",
    slug: "carpentry",
    category: "carpentry",
    description: "Custom carpentry and furniture work",
    basePrice: 700,
    isActive: true
  }
];

export async function POST() {
  try {
    console.log("Seed services API: Starting");
    
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Seed services API: Database connected");

    // Clear existing services
    await ServiceModel.deleteMany({});
    console.log("Seed services API: Cleared existing services");

    // Insert default services
    const services = await ServiceModel.insertMany(DEFAULT_SERVICES);
    console.log("Seed services API: Created services:", services.length);

    return NextResponse.json({
      success: true,
      message: `Seeded ${services.length} services successfully`,
      services: services
    });
  } catch (error: unknown) {
    console.error("Seed services API: Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: errorMessage
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const services = await ServiceModel.find({}).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      services
    });
  } catch (error: unknown) {
    console.error("Seed services API: Error:", error);
    
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 });
  }
}

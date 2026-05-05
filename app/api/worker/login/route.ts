import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WorkerModel } from "@/lib/models/Worker";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Worker login attempt started");
    
    // Connect to database
    await connectToDatabase();
    await ensureDatabaseCollections();
    console.log("Database connected successfully");

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", { email: body.email });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json({ 
        error: "Invalid request format" 
      }, { status: 400 });
    }

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      console.log("Validation failed: missing email or password");
      return NextResponse.json({ 
        error: "Email and password are required" 
      }, { status: 400 });
    }

    // Find worker with error handling
    let worker;
    try {
      worker = await WorkerModel.findOne({ email });
      console.log("Worker lookup result:", worker ? "Worker found" : "Worker not found");
    } catch (dbError) {
      console.error("Database error finding worker:", dbError);
      return NextResponse.json({ 
        error: "Database error occurred" 
      }, { status: 500 });
    }

    if (!worker) {
      console.log("Login failed: worker not found");
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 });
    }

    // Check worker status
    if (worker.status !== "approved") {
      console.log("Login failed: worker not approved, status:", worker.status);
      return NextResponse.json({ 
        error: "Your account is pending admin approval. Please wait for admin to approve your registration." 
      }, { status: 403 });
    }

    // Password comparison (in production, use bcrypt)
    if (worker.password !== password) {
      console.log("Login failed: password mismatch");
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 });
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { 
          id: worker._id,
          email: worker.email,
          fullName: worker.fullName,
          role: "worker"
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      console.log("JWT token generated successfully");
    } catch (jwtError) {
      console.error("JWT generation error:", jwtError);
      return NextResponse.json({ 
        error: "Authentication error" 
      }, { status: 500 });
    }

    // Set cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set("worker-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      console.log("Cookie set successfully");
    } catch (cookieError) {
      console.error("Cookie setting error:", cookieError);
      return NextResponse.json({ 
        error: "Session error" 
      }, { status: 500 });
    }

    console.log("Worker login successful for:", email);
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
      worker: {
        id: worker._id,
        name: worker.fullName,
        email: worker.email,
        serviceType: worker.category,
        location: worker.city,
        status: worker.status
      }
    });
  } catch (error) {
    console.error("Worker login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error details:", errorMessage);
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

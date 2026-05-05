import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Testing admin analytics...");
    
    const analytics = await getAdminAnalytics();
    
    console.log("Analytics result:", JSON.stringify(analytics, null, 2));

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error: unknown) {
    console.error("Debug analytics error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

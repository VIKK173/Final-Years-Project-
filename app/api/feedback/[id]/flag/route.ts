import { NextRequest, NextResponse } from "next/server";
import { FeedbackModel } from "@/lib/models/Feedback";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const feedback = await FeedbackModel.findByIdAndUpdate(
      id,
      { 
        isFlagged: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback flagged successfully",
      feedback: {
        id: feedback._id,
        isFlagged: true
      }
    });
  } catch (error) {
    console.error("Error flagging feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

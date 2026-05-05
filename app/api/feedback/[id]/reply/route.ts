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
    const { reply } = await request.json();

    if (!reply || typeof reply !== 'string') {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    const feedback = await FeedbackModel.findByIdAndUpdate(
      id,
      { 
        adminReply: reply,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Reply added successfully",
      feedback: {
        id: feedback._id,
        adminReply: reply
      }
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

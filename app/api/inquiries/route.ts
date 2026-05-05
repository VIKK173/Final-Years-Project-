import { NextRequest, NextResponse } from "next/server";
import { InquiryModel } from "@/lib/models/Inquiry";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

// GET - fetch inquiries (admin: all, user: filtered by userId)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (email) query.email = email;

    const inquiries = await InquiryModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Inquiry GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// POST - submit a new inquiry (from user help center)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const body = await request.json();
    const { fullName, email, phone, enquiryType, subject, message, isUrgent, userId } = body;

    if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    const inquiry = await InquiryModel.create({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      enquiryType: enquiryType || "other",
      subject: subject?.trim() || "",
      message: message.trim(),
      isUrgent: !!isUrgent,
      userId: userId || "",
      status: "open",
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully! Our team will contact you soon.",
      id: inquiry._id,
    });
  } catch (error) {
    console.error("Inquiry POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit inquiry" }, { status: 500 });
  }
}

// PATCH - admin update status
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();
    const { id, status, adminReply } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const updated = await InquiryModel.findByIdAndUpdate(
      id,
      { $set: { ...(status && { status }), ...(adminReply !== undefined && { adminReply }) } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

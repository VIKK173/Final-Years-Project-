import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OtpModel } from "@/lib/models/Otp";
import { sendSMS, generateOTP } from "@/lib/twilio";
import { ensureDatabaseCollections } from "@/lib/models/init";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Upsert OTP for this phone number
    await OtpModel.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const message = `Your ServiceHub verification code is: ${otp}. Valid for 5 minutes.`;
    const result = await sendSMS(phone, message);

    if (result.success) {
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } else {
      // In development, we might want to return the OTP if Twilio fails or is not configured
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          success: true, 
          message: "Twilio failed, but OTP generated (dev mode)", 
          devOtp: otp 
        });
      }
      return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }
  } catch (error) {
    console.error("OTP Send API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

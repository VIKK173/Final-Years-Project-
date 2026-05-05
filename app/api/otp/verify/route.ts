import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OtpModel } from "@/lib/models/Otp";
import { UserModel } from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";
import { ensureDatabaseCollections } from "@/lib/models/init";

export async function POST(request: Request) {
  try {
    const { phone, otp, fullName, email } = await request.json();
    console.log("OTP Verify Request:", { phone, otp, fullName, email });

    if (!phone || !otp) {
      console.log("OTP Verify: Missing phone or otp");
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();

    // Verify OTP from MongoDB
    const otpRecord = await OtpModel.findOne({ phone, otp });
    console.log("OTP Record Found:", otpRecord);

    if (!otpRecord) {
      console.log("OTP Verify: Invalid OTP - no record found for", { phone, otp });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      console.log("OTP Verify: OTP expired");
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Link phone to user account if verified and logged in
    const { userId } = await auth();
    console.log("OTP Verify: Authenticated Clerk UserID:", userId);

    if (userId) {
      // Update or create user record in MongoDB
      const updateData: any = { phone, isVerified: true };
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;

      console.log("OTP Verify: Updating User with:", updateData);

      try {
        const updatedUser = await UserModel.findOneAndUpdate(
          { clerkId: userId },
          { $set: updateData },
          { upsert: true, new: true, strict: false } // strict: false bypasses schema cache issues
        );
        console.log("OTP Verify: User updated successfully:", updatedUser?._id);
      } catch (syncError) {
        console.error("OTP Verify: User sync failed but OTP was correct:", syncError);
        // We don't return 500 here yet because the OTP was actually correct, 
        // and we want to at least delete the OTP so it's not reused if we return success.
        // Actually, it's better to return success and log the error if the verification itself was fine.
      }
    }

    // ONLY delete OTP after successful processing
    await OtpModel.deleteOne({ _id: otpRecord._id });
    console.log("OTP Record deleted, verification complete.");

    console.log("OTP Verify: Success");
    return NextResponse.json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    console.error("OTP Verify API Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

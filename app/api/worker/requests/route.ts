import { NextResponse } from "next/server";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Worker requests API: Starting GET request");
    
    await connectToDatabase();
    await ensureDatabaseCollections();

    const worker = await getAuthenticatedWorker();
    if (!worker) {
      return NextResponse.json({ 
        error: "Unauthorized - Worker authentication required" 
      }, { status: 401 });
    }

    // City regex to handle slight variations (e.g. "Ranchi" matching "Ranchi, Jharkhand")
    const escapedCity = (worker.city.split(',')[0] || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cityRegex = new RegExp(escapedCity, 'i');

    console.log("Worker requests API: Matching with city filter:", { 
      cityPattern: escapedCity 
    });

    // Filter available jobs ONLY by worker's city
    const requests = await BookingModel.find({ 
      workerId: null, 
      status: "pending",
      "address.city": { $regex: cityRegex }
    })
    .populate('serviceId', 'name category description')
    .sort({ createdAt: -1 });

    // HYPER-DETAILED DEBUG: Check EVERY pending job in the DB
    const allPendingRaw = await BookingModel.find({ workerId: null, status: "pending" });
    console.log(`DEBUG: Found ${allPendingRaw.length} TOTAL pending jobs in DB.`);
    
    allPendingRaw.forEach(b => {
      const cityMatch = cityRegex.test(b.address?.city || "");
      console.log(`DEBUG: EVALUATING Job ${b.bookingCode || b._id}:`, {
        storedCat: b.serviceCategory,
        storedCity: b.address?.city,
        matchesWorkerCity: cityMatch,
        outcome: cityMatch ? "WILL_SHOW" : "HIDDEN"
      });
    });

    console.log(`Worker requests API: Found ${requests.length} matching jobs in ${worker.city}`);

    return NextResponse.json({
      success: true,
      requests: requests.map(req => ({
        id: req._id,
        bookingCode: req.bookingCode,
        serviceName: req.subService || (req.serviceId as any)?.name,
        category: req.serviceCategory,
        amount: req.amount,
        date: req.bookingDate,
        address: req.address,
        notes: req.notes,
        createdAt: req.createdAt
      }))
    });
  } catch (error: unknown) {
    console.error("Worker requests API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

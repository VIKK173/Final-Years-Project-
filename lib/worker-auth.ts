import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { WorkerModel } from "@/lib/models/Worker";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const WORKER_AUTH_COOKIE = "worker-token";

interface WorkerTokenPayload {
  id: string;
  email: string;
  fullName: string;
  role: "worker";
}

export async function signWorkerToken(payload: WorkerTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyWorkerToken(token: string): WorkerTokenPayload {
  return jwt.verify(token, JWT_SECRET) as WorkerTokenPayload;
}

export async function getAuthenticatedWorker(): Promise<any> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WORKER_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyWorkerToken(token);
    const worker = await WorkerModel.findOne({ _id: decoded.id, status: "approved" })
      .select("fullName email phone category city rating totalJobs isAvailable dutyStatus photoUrl experienceYears createdAt")
      .lean();
    return worker;
  } catch {
    return null;
  }
}

export function getWorkerAuthCookieName() {
  return WORKER_AUTH_COOKIE;
}

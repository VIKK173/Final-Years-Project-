import mongoose from "mongoose";
import dns from "node:dns";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongoose = cached;

let dnsServersConfigured = false;

function configureMongoDnsServers() {
  if (dnsServersConfigured) {
    return;
  }

  // Try environment variable first
  const rawServers = process.env.MONGODB_DNS_SERVERS;
  
  // If not set, use default DNS servers automatically
  const servers = rawServers 
    ? rawServers.split(",").map((server) => server.trim()).filter(Boolean)
    : ["8.8.8.8", "1.1.1.1"];

  if (servers.length > 0) {
    try {
      dns.setServers(servers);
      console.log("MongoDB DNS servers configured:", servers.join(", "));
    } catch (error) {
      console.warn("Failed to set DNS servers:", error);
    }
  }
  
  dnsServersConfigured = true;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    console.log("Connecting to MongoDB with URI:", MONGODB_URI.replace(/\/\/.*@/, "//***:***@"));
    
    await configureMongoDnsServers();
    
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "servicehub",
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      // Add additional connection options for better reliability
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverApi: '1',
      retryWrites: true,
      w: 'majority'
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;

    const message = error instanceof Error ? error.message : "Unknown MongoDB connection error";
    console.error("MongoDB connection failed:", message);
    
    if (message.includes("querySrv") || message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
      throw new Error(
        "Database connection failed. Please check your internet connection and try again.",
      );
    }

    if (message.includes("timeout")) {
      throw new Error(
        "Database connection timeout. Please try again in a few moments.",
      );
    }

    if (message.includes("authentication")) {
      throw new Error(
        "Database authentication failed. Please check your database credentials.",
      );
    }

    throw new Error("Unable to connect to database. Please try again later.");
  }

  return cached.conn;
}


import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = (globalThis.__mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === "your_mongodb_atlas_uri_here") {
    const error = new Error("MONGODB_URI not configured");
    (error as Error & { code?: string }).code = "NO_DB";
    throw error;
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export function isDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("code" in error) {
    const code = (error as { code?: unknown }).code;
    if (code === "NO_DB" || code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return true;
    }
  }
  const name = (error as { name?: unknown }).name;
  if (name === "MongoServerSelectionError" || name === "MongoNetworkError") {
    return true;
  }
  return false;
}

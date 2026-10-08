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
    const error = new Error(
      "MONGODB_URI is missing or still the placeholder value. Set it in your .env file."
    );
    (error as Error & { code?: string }).code = "NO_DB";
    throw error;
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
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
  return Boolean(error && typeof error === "object" && "code" in error);
}

import { NextResponse } from "next/server";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Product } from "@/models/Product";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectDB();
    await Product.deleteMany({});
    const created = await Product.insertMany(SEED_PRODUCTS);
    return NextResponse.json({ ok: true, count: created.length });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seeding failed." },
      { status }
    );
  }
}

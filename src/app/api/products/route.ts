import { NextResponse, type NextRequest } from "next/server";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Product } from "@/models/Product";
import { isAdminRequest } from "@/lib/auth";
import { parseProductPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const query = searchParams.get("q")?.trim();
    const inStock = searchParams.get("inStock");

    const filter: Record<string, unknown> = {};
    if (category && category !== "All") filter.category = category;
    if (inStock === "true" || inStock === "false") filter.inStock = inStock === "true";
    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load products.";
    const isDb = isDatabaseError(error);
    const status = isDb ? 503 : 500;
    return NextResponse.json(
      { error: isDb && message.includes("MONGODB_URI") ? "Database not configured." : message },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const payload = parseProductPayload(body);
    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 });
    }

    await connectDB();
    const product = await Product.create(payload.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product." },
      { status }
    );
  }
}

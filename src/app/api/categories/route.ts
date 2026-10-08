import { NextResponse, type NextRequest } from "next/server";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [used, saved] = await Promise.all([
      Product.distinct("category"),
      Category.find({}).lean(),
    ]);

    const savedNames = new Set(saved.map((entry) => entry.name));
    const missing = used.filter((name) => name && !savedNames.has(name));
    if (missing.length) {
      await Category.insertMany(
        missing.map((name) => ({ name })),
        { ordered: false }
      ).catch(() => undefined);
    }

    const categories = await Category.find({}).sort({ createdAt: 1, name: 1 }).lean();
    return NextResponse.json({
      categories: categories.map((entry) => ({ _id: String(entry._id), name: entry.name })),
    });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load categories." },
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
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    if (name.length > 60) {
      return NextResponse.json(
        { error: "Keep category names under 60 characters." },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await Category.find({}).lean();
    if (existing.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: "That category already exists." }, { status: 409 });
    }

    await Category.create({ name });
    const categories = await Category.find({}).sort({ createdAt: 1, name: 1 }).lean();
    return NextResponse.json(
      {
        category: name,
        categories: categories.map((entry) => ({ _id: String(entry._id), name: entry.name })),
      },
      { status: 201 }
    );
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add category." },
      { status }
    );
  }
}

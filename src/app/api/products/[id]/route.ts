import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Product } from "@/models/Product";
import { isAdminRequest } from "@/lib/auth";
import { parseProductPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => null);

    if (body && typeof body === "object" && "inStock" in body && Object.keys(body).length === 1) {
      await connectDB();
      const updated = await Product.findByIdAndUpdate(
        id,
        { inStock: Boolean(body.inStock) },
        { new: true }
      );
      if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
      return NextResponse.json({ product: updated });
    }

    const payload = parseProductPayload(body);
    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 });
    }

    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, payload.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: updated });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product." },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product." },
      { status }
    );
  }
}

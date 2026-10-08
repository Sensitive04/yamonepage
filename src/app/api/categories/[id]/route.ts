import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB, isDatabaseError } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
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
    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    if (category.name.toLowerCase() !== name.toLowerCase()) {
      const clash = await Category.findOne({
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        _id: { $ne: id },
      }).lean();
      if (clash) {
        return NextResponse.json({ error: "That category already exists." }, { status: 409 });
      }
    }

    const previousName = category.name;
    if (previousName !== name) {
      await Category.findByIdAndUpdate(id, { name }, { runValidators: true });
      if (previousName.toLowerCase() !== name.toLowerCase()) {
        await Product.updateMany({ category: previousName }, { category: name });
      }
    }

    const categories = await Category.find({}).sort({ createdAt: 1, name: 1 }).lean();
    return NextResponse.json({
      category: name,
      categories: categories.map((entry) => ({ _id: String(entry._id), name: entry.name })),
    });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to rename category." },
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
    return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
  }

  try {
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const count = await Product.countDocuments({ category: category.name });
    if (count > 0) {
      return NextResponse.json(
        {
          error: `${count} product${count === 1 ? "" : "s"} still use “${category.name}”.`,
          count,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = isDatabaseError(error) ? 503 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete category." },
      { status }
    );
  }
}

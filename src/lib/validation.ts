import { z } from "zod";
import type { ProductPayload } from "./types";

const productSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .trim()
    .min(1, "Name is required.")
    .max(160, "Name must be 160 characters or fewer."),
  category: z
    .string({ error: "Category is required." })
    .trim()
    .min(1, "Category is required.")
    .max(60, "Category must be 60 characters or fewer."),
  price: z
    .number({ error: "Price must be a number." })
    .min(0, "Price cannot be negative.")
    .max(1_000_000, "Price looks too high.")
    .refine((value) => Number.isFinite(value), "Price must be a valid number."),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .default(""),
  image: z
    .string({ error: "Image URL is required." })
    .trim()
    .min(1, "Image URL is required.")
    .max(1000, "Image URL must be 1000 characters or fewer.")
    .refine(
      (value) => /^https?:\/\/\S+$/i.test(value),
      "Image must be a valid http(s) URL."
    ),
  inStock: z.boolean().default(true),
});

export type ParseResult = { data: ProductPayload } | { error: string };

export function parseProductPayload(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }

  const raw = body as Record<string, unknown>;
  const parsed = productSchema.safeParse({
    name: raw.name,
    category: raw.category,
    price: typeof raw.price === "string" ? Number(raw.price) : raw.price,
    description: raw.description ?? "",
    image: raw.image,
    inStock: typeof raw.inStock === "boolean" ? raw.inStock : raw.inStock === "true",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue.path.join(".");
    return { error: path ? `${issue.message} (${path})` : issue.message };
  }

  return { data: parsed.data };
}

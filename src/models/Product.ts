import { Schema, model, models, type Model } from "mongoose";

export interface IProduct {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    image: { type: String, required: true, trim: true, maxlength: 1000 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", category: "text", description: "text" });

export const Product: Model<IProduct> =
  (models.Product as Model<IProduct>) ?? model<IProduct>("Product", ProductSchema);

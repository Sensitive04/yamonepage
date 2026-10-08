import { Schema, model, models, type Model } from "mongoose";

export interface ICategory {
  name: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60, unique: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  (models.Category as Model<ICategory>) ?? model<ICategory>("Category", CategorySchema);

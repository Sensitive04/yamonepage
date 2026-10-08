import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../src/models/Product";
import { SEED_PRODUCTS } from "../src/lib/seed-data";

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === "your_mongodb_atlas_uri_here") {
    console.error(
      "MONGODB_URI is missing or still the placeholder. Copy .env.example to .env and set your Atlas connection string."
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  await Product.deleteMany({});
  console.log("Cleared existing products.");

  const created = await Product.insertMany(SEED_PRODUCTS);
  console.log(`Seeded ${created.length} products:`);
  for (const product of created) {
    console.log(`  - ${product.name} (${product.category}) $${product.price.toFixed(2)}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

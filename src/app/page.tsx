"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";
import { Catalog } from "@/components/product/Catalog";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header onSearch={setQuery} onCategorySelect={setCategory} />

      <main className="flex-1">
        <Hero />
        <Catalog
          category={category}
          onCategoryChange={setCategory}
          query={query}
          onQueryChange={setQuery}
        />
      </main>

      <Footer />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}

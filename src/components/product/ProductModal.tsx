"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { SmartImage } from "@/components/ui/SmartImage";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/ui/Toast";

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  useEffect(() => {
    if (!product) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 backdrop-blur-[2px] sm:items-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-scale-in sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
          aria-label="Close product details"
        >
          <X className="h-5 w-5" />
        </button>

        <ProductDetail key={product._id} product={product} onClose={onClose} />
      </div>
    </div>
  );
}

function ProductDetail({ product, onClose }: { product: Product; onClose: () => void }) {
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);
  const items = useCart((state) => state.items);
  const openCart = useCart((state) => state.open);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const inCart = items.some((item) => item.productId === product._id);

  return (
    <div className="grid md:grid-cols-2">
      <div className="relative aspect-square bg-slate-100 md:aspect-auto md:min-h-[520px]">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-col border-t border-slate-100 p-6 sm:p-8 md:border-l md:border-t-0">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {product.category}
          </p>
          <span className="h-px flex-1 bg-slate-100" aria-hidden="true" />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              product.inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.inStock ? "bg-emerald-500" : "bg-slate-400"
              }`}
              aria-hidden="true"
            />
            {product.inStock ? "In stock" : "Sold out"}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {product.name}
        </h2>

        <p className="mt-3 text-xl font-semibold tabular-nums text-slate-900">
          {formatPrice(product.price)}
        </p>

        <p className="mt-5 text-sm leading-relaxed text-slate-600">
          {product.description || "A Yamone Cosmetics studio essential."}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {!inCart && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 sm:w-auto">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-l-xl text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-r-xl text-slate-700 transition-colors hover:bg-slate-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          {inCart ? (
            <button
              type="button"
              onClick={() => {
                remove(product._id);
                onClose();
                toast("Removed from cart", "info", {
                  label: "Undo",
                  onClick: () => add(product),
                });
              }}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              aria-label={`Remove ${product.name} from cart`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Remove from cart
            </button>
          ) : (
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => {
                add(product, quantity);
                onClose();
                toast("Added to cart", "success", { label: "View cart", onClick: openCart });
              }}
              className="btn-primary min-h-12 flex-1"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {product.inStock
                ? `Add to cart — ${formatPrice(product.price * quantity)}`
                : "Sold out"}
            </button>
          )}
        </div>

        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-6 text-xs text-slate-500">
          <li>Free delivery on orders over $50</li>
          <li>Ships within 1–2 business days</li>
          <li>30-day satisfaction promise</li>
        </ul>
      </div>
    </div>
  );
}

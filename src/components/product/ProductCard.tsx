"use client";

import { Eye, Plus, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { SmartImage } from "@/components/ui/SmartImage";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/ui/Toast";

export function ProductCard({
  product,
  index = 0,
  onQuickView,
}: {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}) {
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);
  const openCart = useCart((state) => state.open);
  const { toast } = useToast();
  const items = useCart((state) => state.items);
  const inCart = items.some((item) => item.productId === product._id);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_28px_60px_-34px_rgba(68,46,36,0.5)] animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <button
        type="button"
        onClick={() => onQuickView?.(product)}
        className="relative block aspect-square w-full overflow-hidden bg-stone-100 text-left sm:aspect-[4/5]"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Soft vignette for legibility of the hover chip. */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-600 shadow-sm backdrop-blur">
            Sold out
          </span>
        )}

        <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-full bg-white/85 px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-800 opacity-0 shadow-sm backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Quick view
        </span>
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-brand-600 sm:block">
          {product.category}
        </p>

        <h3 className="mt-1">
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            title={product.name}
            className="line-clamp-2 text-left font-display text-[15px] font-medium leading-snug text-stone-900 transition-colors hover:text-brand-600"
          >
            {product.name}
          </button>
        </h3>

        <div className="mt-auto flex items-baseline justify-between pt-2.5 sm:pt-3">
          <span className="font-display text-base font-semibold tabular-nums text-stone-900">
            {formatPrice(product.price)}
          </span>
          <span className="hidden items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-500 sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.inStock ? "bg-emerald-500" : "bg-stone-300"
              }`}
              aria-hidden="true"
            />
            {product.inStock ? "In stock" : "Sold out"}
          </span>
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => {
            if (inCart) {
              remove(product._id);
              toast("Removed from cart", "info", {
                label: "Undo",
                onClick: () => add(product),
              });
            } else {
              add(product);
              toast("Added to cart", "success", { label: "View cart", onClick: openCart });
            }
          }}
          className={`mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition-all duration-300 active:scale-[0.98] sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm ${
            !product.inStock
              ? "cursor-not-allowed bg-stone-100 text-stone-400"
              : inCart
                ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                : "bg-stone-900 text-cream shadow-sm hover:bg-stone-800"
          }`}
          aria-label={
            !product.inStock
              ? `${product.name} is out of stock`
              : inCart
                ? `Remove ${product.name} from cart`
                : `Add ${product.name} to cart`
          }
        >
          {!product.inStock ? (
            "Sold out"
          ) : inCart ? (
            <>
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Remove</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Add to cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

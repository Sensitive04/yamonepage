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
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <button
        type="button"
        onClick={() => onQuickView?.(product)}
        className="relative block aspect-square w-full overflow-hidden bg-slate-100 text-left sm:aspect-[4/5]"
        aria-label={`View ${product.name}`}
      >
        <SmartImage
          src={product.image}
          alt={product.name}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
            Sold out
          </span>
        )}

        <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-lg bg-white/85 px-3 py-2.5 text-xs font-semibold text-slate-900 opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Quick view
        </span>
      </button>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <p className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 sm:block">
          {product.category}
        </p>

        <h3 className="mt-1">
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            title={product.name}
            className="line-clamp-2 text-left text-[12.5px] font-medium leading-snug text-slate-900 transition-colors hover:text-brand-600 sm:text-[15px]"
          >
            {product.name}
          </button>
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3">
          <span className="text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
            {formatPrice(product.price)}
          </span>
          <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.inStock ? "bg-emerald-500" : "bg-slate-300"
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
          className={`mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg px-1 text-[12px] font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] sm:mt-3 sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm ${
            !product.inStock
              ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
              : inCart
                ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                : "bg-brand-600 text-white hover:bg-brand-700"
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
              <span className="hidden sm:inline">Remove from cart</span>
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

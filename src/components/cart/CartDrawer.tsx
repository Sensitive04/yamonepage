"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { deliveryFee, formatPrice, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";
import { SmartImage } from "@/components/ui/SmartImage";

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const items = useCart((state) => state.items);
  const isOpen = useCart((state) => state.isOpen);
  const close = useCart((state) => state.close);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);

  // Hydrate the persisted cart after mount (skipHydration is set on the store),
  // keeping server and client first renders in sync.
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const subtotal = cartSubtotal(items);
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-stone-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[65] flex w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Your cart</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {cartCount(items)} item{cartCount(items) === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-500">
              <ShoppingBag className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold text-stone-900">Your cart is empty</h3>
            <p className="max-w-xs text-sm text-stone-500">
              Add a few favourites — they&apos;ll wait for you right here.
            </p>
            <button type="button" onClick={close} className="btn-primary mt-1">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-stone-100 overflow-y-auto border-b border-stone-100">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 px-5 py-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <SmartImage src={item.image} alt={item.name} className="object-cover" sizes="80px" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-900">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-rose-600"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <div className="flex items-center rounded-lg border border-stone-200">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="flex h-11 w-11 items-center justify-center text-stone-700 transition-colors hover:bg-stone-50"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="flex h-11 w-11 items-center justify-center text-stone-700 transition-colors hover:bg-stone-50"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="px-5 py-5">
              {remaining > 0 && (
                <div className="mb-4">
                  <div className="flex items-baseline justify-between text-xs text-stone-500">
                    <span>Add {formatPrice(remaining)} for free delivery</span>
                    <span className="font-medium tabular-nums text-stone-900">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-500">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold tabular-nums text-stone-900">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-stone-500">
                  <dt>Delivery</dt>
                  <dd className="font-semibold tabular-nums text-stone-900">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-stone-100 pt-3 text-base font-semibold text-stone-900">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => {
                  close();
                  onCheckout();
                }}
                className="btn-primary mt-5 w-full"
              >
                Proceed to checkout
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

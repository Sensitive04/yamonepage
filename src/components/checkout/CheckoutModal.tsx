"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { deliveryFee, formatPrice } from "@/lib/constants";
import { createOrder } from "@/lib/api-client";
import { generateInvoicePdf } from "@/lib/receipt";
import { cartSubtotal, useCart } from "@/store/cart";
import { useToast } from "@/components/ui/Toast";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  phone: string;
  address: string;
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  const subtotal = cartSubtotal(items);
  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (form.phone.replace(/\D/g, "").length < 7) next.phone = "Please enter a valid phone number.";
    if (form.address.trim().length < 8) next.address = "Please enter a delivery address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast("Your bag is empty.", "error");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    const customer = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    try {
      // 1. Persist the order and notify the shop; receive the order number + bot link.
      const { orderNumber, botLink } = await createOrder({ items, customer });

      // 2. Generate + download the branded PDF invoice in the browser.
      generateInvoicePdf(items, customer, orderNumber);

      // 3. Hand the customer over to the Telegram bot to confirm and chat.
      if (botLink) {
        window.open(botLink, "_blank", "noopener,noreferrer");
      }

      clear();
      setForm({ name: "", phone: "", address: "" });
      toast("Order placed! Continue in Telegram to confirm.", "success");
      onClose();
    } catch (error) {
      console.error(error);
      toast(
        error instanceof Error ? error.message : "Could not complete checkout. Try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-stone-900/50 backdrop-blur-[2px] sm:items-center sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-stone-200 bg-white shadow-2xl animate-scale-in sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
          aria-label="Close checkout"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-stone-100 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Checkout
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
            Delivery details
          </h2>
        </div>

        <div className="border-b border-stone-100 bg-stone-50 px-6 py-4 text-sm sm:px-8">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4 py-1 text-stone-700">
              <span className="line-clamp-1">
                {item.name} <span className="text-stone-500">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-stone-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-stone-200 pt-2 text-stone-700">
            <span>Delivery</span>
            <span className="font-semibold tabular-nums text-stone-900">
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t border-stone-200 pt-2 text-base font-semibold text-stone-900">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6 sm:px-8" noValidate>
          <div>
            <label htmlFor="checkout-name" className="mb-1.5 block text-xs font-medium text-stone-700">
              Full name
            </label>
            <input
              id="checkout-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Amara Okafor"
              className="input-field"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="checkout-phone" className="mb-1.5 block text-xs font-medium text-stone-700">
              Phone number
            </label>
            <input
              id="checkout-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+1 555 010 2030"
              className="input-field"
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="checkout-address" className="mb-1.5 block text-xs font-medium text-stone-700">
              Delivery address
            </label>
            <textarea
              id="checkout-address"
              autoComplete="street-address"
              rows={3}
              value={form.address}
              onChange={update("address")}
              placeholder="12 Rosewood Avenue, Apt 4, Lekki Phase 1, Lagos"
              className="input-field resize-none"
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Preparing order…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" /> Confirm &amp; Order via Telegram
              </>
            )}
          </button>

          <p className="text-center text-xs leading-relaxed text-stone-500">
            Your branded PDF invoice downloads instantly, then we open our Telegram bot to
            confirm your order.
          </p>
        </form>
      </div>
    </div>
  );
}

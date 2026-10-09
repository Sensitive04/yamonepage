"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product._id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product._id
                ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
                : item
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: Math.min(quantity, 99),
            },
          ],
        });
      },

      remove: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.min(quantity, 99) } : item
          ),
        });
      },

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "yamone-cart",
      // Defer storage hydration to the client mount (see CartDrawer) so the
      // server HTML and first client render are identical.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }) as CartState,
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<CartState>),
        isOpen: false,
      }),
    }
  )
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

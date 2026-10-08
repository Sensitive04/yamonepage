export const CURRENCY = "$";

export const CATEGORIES = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Body Care",
  "Fragrance",
  "Accessories",
] as const;

export const DELIVERY_FEE = 5.99;
export const FREE_DELIVERY_THRESHOLD = 50;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const PRICE_BANDS = [
  { value: "all", label: "All prices", min: 0, max: Infinity },
  { value: "under-20", label: "Under $20", min: 0, max: 19.99 },
  { value: "20-40", label: "$20 – $40", min: 20, max: 40 },
  { value: "over-40", label: "Over $40", min: 40.01, max: Infinity },
] as const;

export type PriceBandValue = (typeof PRICE_BANDS)[number]["value"];

export function formatPrice(value: number): string {
  return `${CURRENCY}${value.toFixed(2)}`;
}

export function deliveryFee(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_FEE;
}

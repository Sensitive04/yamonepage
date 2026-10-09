"use client";

import { PRICE_BANDS, type PriceBandValue } from "@/lib/constants";

export interface FilterControlsProps {
  priceBand: PriceBandValue;
  onPriceBandChange: (value: PriceBandValue) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
}

export function FilterControls({
  priceBand,
  onPriceBandChange,
  inStockOnly,
  onInStockOnlyChange,
}: FilterControlsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Price</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRICE_BANDS.map((band) => {
            const active = priceBand === band.value;
            return (
              <button
                key={band.value}
                type="button"
                onClick={() => onPriceBandChange(band.value)}
                className={`min-h-10 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                }`}
                aria-pressed={active}
              >
                {band.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Availability
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={inStockOnly}
          onClick={() => onInStockOnlyChange(!inStockOnly)}
          className="mt-2 flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
        >
          In stock only
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              inStockOnly ? "bg-brand-600" : "bg-stone-200"
            }`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                inStockOnly ? "left-[22px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

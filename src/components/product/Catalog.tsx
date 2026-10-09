"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/types";
import {
  CATEGORIES,
  PRICE_BANDS,
  SORT_OPTIONS,
  type PriceBandValue,
  type SortValue,
} from "@/lib/constants";
import { fetchCategories, fetchProducts } from "@/lib/api-client";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { FilterSheet } from "./FilterSheet";
import { ProductSkeleton } from "./ProductSkeleton";

export function Catalog({
  category,
  onCategoryChange,
  query,
  onQueryChange,
}: {
  category: string;
  onCategoryChange: (category: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [priceBand, setPriceBand] = useState<PriceBandValue>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortValue>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const tabs = useMemo(() => ["All", ...categories], [categories]);

  const retry = () => {
    setLoading(true);
    setError(null);
    load();
  };

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.category, (map.get(product.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const totalCount = useMemo(() => {
    let total = 0;
    for (const value of categoryCounts.values()) total += value;
    return total;
  }, [categoryCounts]);

  const band = useMemo(
    () => PRICE_BANDS.find((option) => option.value === priceBand) ?? PRICE_BANDS[0],
    [priceBand],
  );

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (inStockOnly && !product.inStock) return false;
      if (product.price < band.min || product.price > band.max) return false;
      if (normalized) {
        const haystack =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });

    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name-asc") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, query, inStockOnly, band, sort]);

  const resetFilters = useCallback(() => {
    setPriceBand("all");
    setInStockOnly(false);
    setSort("featured");
    onCategoryChange("All");
    onQueryChange("");
  }, [onCategoryChange, onQueryChange]);

  const filterProps = {
    priceBand,
    onPriceBandChange: setPriceBand,
    inStockOnly,
    onInStockOnlyChange: setInStockOnly,
  };

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (category !== "All") {
    activeChips.push({ key: "category", label: category, clear: () => onCategoryChange("All") });
  }
  if (query.trim()) {
    activeChips.push({ key: "query", label: `“${query.trim()}”`, clear: () => onQueryChange("") });
  }
  if (priceBand !== "all") {
    activeChips.push({ key: "price", label: band.label, clear: () => setPriceBand("all") });
  }
  if (inStockOnly) {
    activeChips.push({ key: "stock", label: "In stock only", clear: () => setInStockOnly(false) });
  }

  return (
    <section
      id="catalog"
      className="scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="max-w-2xl animate-fade-up">
        <span className="eyebrow">The collection</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Find your next obsession
        </h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Clean formulas across skincare, makeup, haircare and more — filtered to exactly what
          you need.
        </p>
      </div>

      <div className="-mx-4 mt-4 border-b border-stone-200/60 bg-cream px-4 py-3 sm:-mx-6 sm:px-6 lg:sticky lg:top-18 lg:z-30 lg:-mx-8 lg:bg-cream/90 lg:px-8 lg:backdrop-blur-md">
        <div className="flex items-start gap-2">
          <div
            className="flex min-w-0 flex-1 flex-wrap gap-2"
            role="tablist"
            aria-label="Filter by category"
          >
            {tabs.map((tab) => {
              const active = category === tab;
              const count = tab === "All" ? totalCount : (categoryCounts.get(tab) ?? 0);
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryChange(tab)}
                  className={`pill-tab ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "hover:border-stone-300 hover:text-stone-900"
                  }`}
                >
                  {tab}
                  <span
                    className={`hidden text-xs font-semibold tabular-nums sm:inline ${
                      active ? "text-white/75" : "text-stone-400"
                    }`}
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative flex min-h-11 shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg bg-stone-900 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeChips.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="min-w-0">
          {!loading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="text-sm text-stone-500" aria-live="polite">
                  {visible.length} product{visible.length === 1 ? "" : "s"}
                  {category !== "All" ? ` in ${category}` : ""}
                </p>

                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 py-1 pl-3 pr-1 text-xs font-medium text-stone-600"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.clear}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700"
                      aria-label={`Remove filter: ${chip.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {activeChips.length > 1 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label className="hidden items-center gap-2 text-sm text-stone-500 lg:flex">
                  Price
                  <select
                    value={priceBand}
                    onChange={(event) => setPriceBand(event.target.value as PriceBandValue)}
                    className="input-field w-auto"
                    aria-label="Price range"
                  >
                    {PRICE_BANDS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  role="switch"
                  aria-checked={inStockOnly}
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`hidden min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors lg:inline-flex ${
                    inStockOnly
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-900"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${inStockOnly ? "bg-brand-600" : "bg-stone-300"}`}
                    aria-hidden="true"
                  />
                  In stock
                </button>

                <label className="flex items-center gap-2 text-sm text-stone-500">
                  Sort
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortValue)}
                    className="input-field w-auto"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          <div className="mt-5">
            {loading && (
              <div
                className="grid grid-cols-3 gap-x-2.5 gap-y-3 sm:gap-4 xl:grid-cols-4"
                aria-hidden="true"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-100 bg-white px-6 py-20 text-center shadow-sm">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-500">
                  <PackageSearch className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                  We couldn&apos;t reach the catalog
                </h3>
                <p className="max-w-md text-sm text-stone-500">{error}</p>
                <button type="button" onClick={retry} className="btn-primary">
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && visible.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-100 bg-white px-6 py-20 text-center shadow-sm">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-500">
                  <Search className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                  No matches found
                </h3>
                <p className="max-w-md text-sm text-stone-500">
                  Nothing matched{query ? ` “${query}”` : " these filters"}. Try a different
                  search or category.
                </p>
                <button type="button" onClick={resetFilters} className="btn-ghost">
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && visible.length > 0 && (
              <div className="grid grid-cols-3 gap-x-2.5 gap-y-3 sm:gap-4 xl:grid-cols-4">
                {visible.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onQuickView={setQuickView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
        {...filterProps}
      />

      <ProductModal product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
}

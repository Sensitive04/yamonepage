"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { CATEGORIES } from "@/lib/constants";
import { fetchCategories } from "@/lib/api-client";

export function Header({
  onSearch,
  onCategorySelect,
}: {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
}) {
  const items = useCart((state) => state.items);
  const toggle = useCart((state) => state.toggle);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    const onClick = (event: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) setShopOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShopOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [shopOpen]);

  const count = cartCount(items);
  const categoryItems = ["All", ...categories];

  const goToCatalog = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const goCatalog = (category: string) => {
    onCategorySelect?.(category);
    setShopOpen(false);
    setSearchOpen(false);
    goToCatalog();
  };

  const submitSearch = () => {
    onSearch?.(searchValue);
    setSearchOpen(false);
    goToCatalog();
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-18 lg:gap-5 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-1.5"
          aria-label="Yamone Cosmetics — home"
        >
          <span className="text-xl font-semibold leading-none tracking-tight text-slate-900 transition-colors group-hover:text-brand-600 lg:text-2xl">
            Yamone
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <div ref={shopRef} className="relative">
            <button
              type="button"
              onClick={() => setShopOpen((open) => !open)}
              className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-expanded={shopOpen}
              aria-haspopup="true"
            >
              Shop
              <ChevronDown
                className={`h-4 w-4 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {shopOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-scale-in">
                {categoryItems.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => goCatalog(category)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    {category === "All" ? "All products" : category}
                    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={goToCatalog}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Contact
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <label className="relative hidden md:block">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="Search products"
              className="h-11 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:w-56 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
            />
          </label>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={toggle}
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-3 md:hidden animate-fade-in">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              autoFocus
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="Search products"
              className="input-field pl-9"
            />
          </label>
        </div>
      )}

    </header>
  );
}

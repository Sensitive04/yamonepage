"use client";

import { ArrowRight, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";

const TRUST = [
  { icon: Leaf, label: "Clean formulas" },
  { icon: ShieldCheck, label: "Cruelty-free" },
  { icon: Truck, label: "Free delivery $50+" },
];

export function Hero() {
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-14">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            New — The Radiance Edit
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Beauty that feels as <span className="text-brand-600">luxurious</span> as it looks.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Premium skincare, makeup and haircare built on clean actives — elegant results,
            delivered fast to your door.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalog" className="btn-primary group">
              Shop the collection
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
            <a href="#catalog" className="btn-ghost">
              Browse categories
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {TRUST.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-brand-600 shadow-sm">
                  <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-lg sm:aspect-[16/10] lg:aspect-[4/3]">
            <SmartImage
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1100&q=80"
              alt="Model applying premium cosmetics"
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 44vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Free delivery</p>
              <p className="text-xs text-slate-600">on orders over $50</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

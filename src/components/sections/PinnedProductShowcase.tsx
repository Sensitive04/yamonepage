"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
}

interface PinnedProductShowcaseProps {
  products: Product[];
  className?: string;
}

export function PinnedProductShowcase({ products, className }: PinnedProductShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (!sectionRef.current || !containerRef.current || !trackRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const section = sectionRef.current!;
      const track = trackRef.current!;
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

      const totalWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;

      gsap.to(track, {
        x: -(totalWidth - viewportWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            cards.forEach((card, index) => {
              const cardCenter = card.offsetLeft + card.offsetWidth / 2;
              const viewportCenter = viewportWidth / 2 + progress * (totalWidth - viewportWidth);
              const distance = Math.abs(cardCenter - viewportCenter);
              const maxDistance = viewportWidth / 2;
              const scale = gsap.utils.clamp(0.92, 1.05, 1.05 - (distance / maxDistance) * 0.13);
              const opacity = gsap.utils.clamp(0.6, 1, 1 - (distance / maxDistance) * 0.4);
              gsap.set(card, { scale, opacity });
            });
          },
        },
      });

      ScrollTrigger.refresh();
    });

    mm.add("(max-width: 767px)", () => {
      const track = trackRef.current!;
      track.style.transform = "none";
      ScrollTrigger.killAll();
    });

    return () => {
      mm.revert();
    };
  }, [products, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <section className={cn("py-12 sm:py-16 lg:py-24", className)}>
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Featured Collection
          </h2>
        </div>
        <div className="mt-8 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[280px] flex-shrink-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:min-w-[320px]"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">{product.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn("relative h-[300vh] py-12 sm:py-16 lg:py-24", className)}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Featured Collection
          </h2>
        </div>
        <div ref={containerRef} className="mt-8 flex h-[calc(100vh-8rem)] items-center px-4 sm:px-6 lg:px-8">
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform"
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                className="min-w-[280px] flex-shrink-0 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:min-w-[320px] lg:min-w-[380px]"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">{product.category}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

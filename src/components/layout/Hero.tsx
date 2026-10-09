"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";

// Curated imagery — brand storytelling, no fabricated numbers or reviews anywhere.
const IMG = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_IMAGES = {
  main: IMG("1596462502278-27bfdc403348", 1100),
  product: IMG("1620916566398-39f1143ab7be", 400),
};

// Factual craft values (not social proof) shown as a refined micro-list.
const VALUES = ["Clean actives", "Small-batch", "Cruelty-free"];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // `true` only after hydration — keeps the first client render identical to the
  // SSR output without calling setState inside an effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Scroll-driven parallax: copy drifts up + fades while the showcase lags behind,
  // creating depth that hands off seamlessly to the next section.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);

  const parallax = mounted && !reduce;
  const contentStyle = parallax ? { y: contentY, opacity: contentOpacity } : undefined;
  const imageStyle = parallax ? { y: imageY } : undefined;
  const orbStyle = parallax ? { y: orbY } : undefined;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-cream"
    >
      {/* Warm ambient wash: soft rose + champagne orbs on cream. */}
      <motion.div
        aria-hidden="true"
        style={orbStyle}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-cream" />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[380px] w-[380px] rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-rose-100/60 blur-3xl" />
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-14">
        {/* ------------------------------ Copy ------------------------------ */}
        <motion.div
          style={contentStyle}
          className="lg:col-span-6"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
          >
            {/* Eyebrow badge. */}
            <motion.span
              variants={rise}
              className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-stone-700 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
              The Radiance Edit
            </motion.span>

            {/* Fluid serif headline with a champagne-rose gradient accent. */}
            <motion.h1
              variants={rise}
              className="mt-5 font-display text-[clamp(2.35rem,7vw,4.75rem)] font-medium leading-[1.03] tracking-tight text-stone-900"
            >
              Luminous skin,{" "}
              <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400 bg-clip-text italic text-transparent">
                quietly
              </span>{" "}
              luxurious.
            </motion.h1>

            <motion.p
              variants={rise}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg lg:mx-0"
            >
              Yamone crafts elevated essentials in small batches — pure actives, couture
              textures, and a glow that speaks softly.
            </motion.p>

            {/* CTA group. */}
            <motion.div
              variants={rise}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
            >
              <a
                href="#catalog"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-medium text-[#FBF7F2] shadow-lg shadow-stone-900/10 transition-all duration-300 hover:bg-stone-800 hover:shadow-stone-900/25 active:scale-95"
              >
                Explore Collection
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </motion.div>

            {/* Craft values micro-list. */}
            <motion.ul
              variants={rise}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500 lg:justify-start"
            >
              {VALUES.map((value, i) => (
                <li key={value} className="flex items-center gap-5">
                  <span>{value}</span>
                  {i < VALUES.length - 1 && (
                    <span className="h-1 w-1 rounded-full bg-stone-300" aria-hidden="true" />
                  )}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        {/* --------------------------- Showcase --------------------------- */}
        <motion.div
          style={imageStyle}
          className="relative mx-auto w-full max-w-sm sm:max-w-md lg:col-span-6 lg:max-w-md"
        >
          {/* Soft glow + thin champagne frame behind the arch. */}
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-full bg-rose-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-[14rem_14rem_2.5rem_2.5rem] border border-amber-300/60"
          />

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* Arched editorial portrait. */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-[14rem_14rem_2.5rem_2.5rem] shadow-[0_40px_90px_-40px_rgba(68,46,36,0.55)]">
              <SmartImage
                src={HERO_IMAGES.main}
                alt="Model applying Yamone cosmetics"
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Floating product detail — subtle, always in gentle motion. */}
          <div className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-2.5 pr-5 shadow-xl backdrop-blur-md animate-float motion-reduce:animate-none sm:-left-6">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-rose-50">
              <SmartImage
                src={HERO_IMAGES.product}
                alt="Rose Glow Vitamin C Serum"
                className="object-cover"
                sizes="56px"
              />
            </span>
            <div>
              <p className="font-display text-sm font-medium text-stone-900">Rose Glow Serum</p>
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500">
                Vitamin C · 30ml
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue (desktop only) — invites the seamless continuation. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
        <span className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-stone-400">
          Scroll
          <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

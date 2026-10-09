"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      gestureOrientation: "vertical",
            smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    ScrollTrigger.refresh();

    const onScrollUpdate = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScrollUpdate);

    const resizeHandler = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", resizeHandler);

    return () => {
      lenis.off("scroll", onScrollUpdate);
      window.removeEventListener("resize", resizeHandler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollTextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

interface WordProps {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  className?: string;
}

function Word({ word, index, total, scrollYProgress, className }: WordProps) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], [0.2, 1, 1, 0.2]);
  const scale = useTransform(scrollYProgress, [start - 0.1, start, end], [0.98, 1, 1]);

  return (
    <motion.span
      key={word + "-" + index}
      style={{ opacity, scale }}
      className={cn("will-change-transform", className)}
    >
      {word}
    </motion.span>
  );
}

export function ScrollTextReveal({ text, className, wordClassName }: ScrollTextRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const words = text.split(" ");

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={cn("flex flex-wrap gap-2", className)}>
        {words.map((word, index) => (
          <span key={word + "-" + index} className={cn("opacity-100", wordClassName)}>
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex flex-wrap gap-2", className)}>
      {words.map((word, index) => (
        <Word
          key={word + "-" + index}
          word={word}
          index={index}
          total={words.length}
          scrollYProgress={scrollYProgress}
          className={wordClassName}
        />
      ))}
    </div>
  );
}

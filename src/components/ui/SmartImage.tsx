"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK_SRC = "/placeholder.svg";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function SmartImage({ src, alt, className, sizes, priority }: SmartImageProps) {
  const [current, setCurrent] = useState(src || FALLBACK_SRC);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (current !== FALLBACK_SRC) setCurrent(FALLBACK_SRC);
      }}
    />
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Product images are external admin-provided URLs (Unsplash / Pexels / CDN),
    // rendered through <img> with a local fallback instead of next/image optimization.
    unoptimized: true,
    // Allows the local /placeholder.svg fallback to render through next/image.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

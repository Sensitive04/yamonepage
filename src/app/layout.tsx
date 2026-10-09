import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yamone Cosmetics - Premium Skincare, Makeup & Haircare",
    template: "%s | Yamone Cosmetics",
  },
  description:
    "Yamone Cosmetics is a premium beauty house for skincare, makeup, haircare and fragrance - clean formulas, elegant results, delivered fast.",
  keywords: [
    "cosmetics",
    "skincare",
    "makeup",
    "haircare",
    "fragrance",
    "beauty",
    "Yamone Cosmetics",
  ],
  openGraph: {
    title: "Yamone Cosmetics",
    description: "Premium skincare, makeup, haircare and fragrance.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <SmoothScrollProvider>
          <ToastProvider>{children}</ToastProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

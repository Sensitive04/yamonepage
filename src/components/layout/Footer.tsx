"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { fetchTelegramUsername } from "@/lib/api-client";

const SOCIALS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@yamonecosmetics",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.4a2.6 2.6 0 1 1-1.85-2.49V9.7a5.72 5.72 0 1 0 4.95 5.67V9.01a7.35 7.35 0 0 0 4.3 1.38V7.27a4.3 4.3 0 0 1-3.24-1.45z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/yamonecosmetics",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.02H7.9v-2.92h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.92h-2.34V22C18.34 21.24 22 17.08 22 12.06z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "", // resolved from /api/config below, fallback used until loaded
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  const [telegramHandle, setTelegramHandle] = useState("");

  useEffect(() => {
    let alive = true;
    fetchTelegramUsername()
      .then((username) => {
        if (alive && username) setTelegramHandle(username);
      })
      .catch(() => {
        /* config unavailable — fallback link stays */
      });
    return () => {
      alive = false;
    };
  }, []);

  const telegramHref = telegramHandle
    ? `https://t.me/${telegramHandle}`
    : "https://t.me/yamonecosmetics";

  return (
    <footer id="contact" className="scroll-mt-24 border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:py-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5" aria-label="Yamone Cosmetics — home">
              <span className="text-xl font-semibold leading-none tracking-tight text-slate-900">
                Yamone
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Premium beauty essentials formulated with skin-loving actives. Crafted in small
              batches, delivered to your door.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.label === "Telegram" ? telegramHref : social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700"
                >
                  {social.icon}
                  <span className="hidden sm:inline">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                12 Rosewood Avenue, Lagos
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <a
                  href="tel:+15550102030"
                  className="min-h-11 py-2 transition-colors hover:text-brand-600"
                >
                  +1 555 010 2030
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <a
                  href="mailto:hello@yamonecosmetics.com"
                  className="transition-colors hover:text-brand-600"
                >
                  hello@yamonecosmetics.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 py-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Yamone Cosmetics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

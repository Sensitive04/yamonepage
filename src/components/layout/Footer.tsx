"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { fetchTelegramBotUsername } from "@/lib/api-client";

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
    href: "", // resolved from /api/config below
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    ),
  },
];

export function Footer() {
  const [botUsername, setBotUsername] = useState("");

  useEffect(() => {
    let alive = true;
    fetchTelegramBotUsername()
      .then((username) => {
        if (alive) setBotUsername(username);
      })
      .catch(() => {
        /* config unavailable — Telegram button stays hidden */
      });
    return () => {
      alive = false;
    };
  }, []);

  const telegramHref = botUsername ? `https://t.me/${botUsername}` : "";

  return (
    <footer id="contact" className="relative scroll-mt-24 overflow-hidden bg-stone-950 text-stone-400">
      {/* Champagne hairline + soft rose glow along the top edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:gap-16 lg:py-20">
          {/* Brand. */}
          <div className="lg:pr-10">
            <Link href="/" className="inline-flex items-center gap-1.5" aria-label="Yamone Cosmetics — home">
              <span className="font-display text-3xl font-semibold leading-none tracking-tight text-cream">
                Yamone
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
              Elevated beauty essentials, crafted in small batches — pure actives, couture
              textures, and a glow that speaks softly.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {SOCIALS.map((social) => {
                const href = social.label === "Telegram" ? telegramHref : social.href;
                if (!href) return null;
                return (
                  <a
                    key={social.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm font-medium text-stone-300 transition-colors hover:border-brand-400/50 hover:text-brand-300"
                  >
                    {social.icon}
                    <span className="hidden sm:inline">{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact. */}
          <div className="sm:justify-self-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500">
              Contact
            </p>
            <ul className="mt-5 space-y-4 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                12 Rosewood Avenue, Lagos
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                <a
                  href="tel:+15550102030"
                  className="min-h-11 py-2 transition-colors hover:text-cream"
                >
                  +1 555 010 2030
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                <a
                  href="mailto:hello@yamonecosmetics.com"
                  className="transition-colors hover:text-cream"
                >
                  hello@yamonecosmetics.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Yamone Cosmetics. All rights reserved.
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Small-batch beauty · Crafted with care
          </p>
        </div>
      </div>
    </footer>
  );
}

# Yamone Cosmetics

Full-stack e-commerce storefront for **Yamone Cosmetics** — a warm, feminine cosmetics shop with a client-side cart, branded PDF invoices, Telegram checkout hand-off, and a password-protected admin dashboard.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · MongoDB (Mongoose)**.

## Features

**Storefront**
- Hero section, category filters, responsive product grid (blush / rose-gold design system)
- Product quick-view modal with quantity picker
- Slide-out cart drawer with quantity controls and live totals (persisted via Zustand)
- Checkout flow: captures customer details → downloads a branded **PDF invoice** (jsPDF) → opens **Telegram** with a pre-filled order summary
- Polished loading, empty, and error states with toast notifications

**Admin dashboard** (protected at `/admin`)
- Password login (HMAC-signed httpOnly cookie, 7-day expiry)
- Product CRUD: create / edit / delete, live image-URL thumbnail preview, in-stock toggle
- Stats cards, sample catalogue seed button, confirm dialogs
- Route protection in `src/proxy.ts` + re-checked on every mutating API route

## Getting started

```bash
npm install
cp .env.example .env      # then fill in real values
```

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | server only | MongoDB Atlas connection string. Seeded routes return `503` while it is missing or still the placeholder. |
| `ADMIN_PASSWORD` | server only | Admin login password; also the HMAC secret for the auth cookie. |
| `TELEGRAM_USERNAME` | server only | Telegram handle for checkout hand-off (client reads it from `GET /api/config`). |

### Local development

```bash
npm run dev        # http://localhost:3000
```

Seed the sample catalogue (14 products) — either:

- visit `/admin`, log in, and click **Seed samples**, or
- run `npm run seed` with `MONGODB_URI` set.

> Products store **direct image URLs** (Unsplash/CDN) — no binary data in the database.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run seed` | Seed the sample catalogue into MongoDB |

## Deploying to Netlify

1. Push this repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. The included `netlify.toml` auto-detects the Next.js build (`@netlify/plugin-nextjs`) — no build settings needed.
4. Under **Site configuration → Environment variables**, add:
   - `MONGODB_URI` (from MongoDB Atlas — allow Netlify's IPs or use `0.0.0.0/0` for simplicity)
   - `ADMIN_PASSWORD`
   - `TELEGRAM_USERNAME` (without the `@`)
5. Deploy, then open `/admin` and click **Seed samples** to load the catalogue.

## Project structure

```
src/
  app/
    page.tsx                 # storefront (hero + catalog)
    admin/                   # dashboard + login pages
    api/                     # products, auth, seed, config routes
  components/
    layout/  product/  cart/  checkout/  admin/  ui/
  lib/                       # db, auth, validation, receipt (PDF/Telegram), seed data
  models/Product.ts
  store/cart.ts              # Zustand cart
  proxy.ts                   # Next 16 middleware — guards /admin/*
scripts/seed.ts
```

## Security notes

- Admin auth: HMAC-signed `yamone_admin` cookie — `HttpOnly`, `SameSite=Lax`, `Secure`, 7-day expiry.
- Every `POST`/`PUT`/`DELETE` product and seed route re-verifies the cookie server-side.
- All product input is validated with Zod before touching the database.
- Secrets never reach the client bundle; only `TELEGRAM_USERNAME` is exposed, via `/api/config`.

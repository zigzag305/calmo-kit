# CalmoKit — Website Security & Performance Model

Adapted from [`zigzag305/ECC`](https://github.com/zigzag305/ECC) (`security-review`, `react-performance`, `performance-optimizer`, and `marketing-campaign` skills).

## 1. Performance Budget & Architecture

| Metric | Target | CalmoKit Implementation |
|---|---|---|
| Initial JS Bundle (gzipped) | < 100 KB (ECC limit: < 200 KB) | Removed `three` + `framer-motion`; React `lazy()` + `Suspense` for modals and below-the-fold sections. |
| LCP (Largest Contentful Paint) | < 2.5s (4G mobile) | Zero JS animation delay on `HeroSection`; `<link rel="preload" as="image">` for hero radio WebP `srcSet`; explicit `width`/`height` on images. |
| CLS (Cumulative Layout Shift) | < 0.1 | Fixed `aspect-square` containers, explicit `width`/`height` attributes, self-hosted Latin-only `@fontsource` WOFF2 fonts. |
| TBT (Total Blocking Time) | < 200ms | No WebGL/Three.js main-thread work; `content-visibility: auto` on below-the-fold sections (`CatalogSection`, `CinematicKitShowcase`, `ScenarioFinder`, `FaqAndFooter`). |
| Mobile Ergonomics | 390px+ zero overflow | `overflow-x: clip`, `min-h-[44px]` touch targets, `text-base sm:text-sm` (16px) inputs to prevent iOS Safari zoom, full-width primary hero CTA on phones. |
| Static Caching | Immutable assets | `/assets/*` cached 1 year immutable; `/images/*` cached 7 days with `stale-while-revalidate=86400`. |

## 2. Security Controls

### Secrets & Credentials
- Zero secrets in client bundle or repository (`CALMO_STRIPE_SECRET_KEY`, `CALMO_STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` live exclusively in Supabase Edge Function secrets, trimmed on read).
- Public Supabase anon key only in `netlify.toml`; database protected by Row Level Security (RLS).

### Checkout & Payment Integrity
- **Server-side pricing (`supabase/functions/_shared/calmoCatalog.ts`)**: `calmo-create-checkout` rebuilds every cart line from the catalog, ignoring any client-supplied prices or names. Out-of-stock (`inStock: false`) items are rejected with HTTP 400.
- **Origin allowlist**: Redirect `success_url` / `cancel_url` restricted to `calmokit.eu`, `*.calmokit.netlify.app`, and `localhost`.
- **Webhook authenticity**: `calmo-stripe-webhook` verifies `stripe-signature` via `stripe.webhooks.constructEventAsync`, scopes updates strictly to `source_app === "calmo-kit"`, and flags excluded island/enclave postcodes (`07`, `35`, `38`, `51`, `52` in ES; `9xxx` in PT).

### Transport, Headers & Privacy
- **HSTS**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
- **CSP**: Explicit allowlist in `netlify.toml` for `'self'`, Supabase API, Stripe Checkout form actions, and consent-gated Google/Meta endpoints; `object-src 'none'`, `frame-ancestors 'self'`, `base-uri 'self'`, `upgrade-insecure-requests`.
- **GDPR / AEPD / CNPD Consent Mode**: Self-hosted fonts (no Google Fonts IP leak); neither Google Tag nor Meta Pixel loads or fires until explicit user consent via `CookieBanner`.

## 3. Ongoing Audit Checklist (Before Scaling Ads)
1. Run `npm run build` and verify gzipped entry chunk stays `< 100 KB`.
2. Run `npx tsx supabase/functions/_shared/calmoCart_test.ts` after any catalog or shipping change.
3. Run `npm audit --omit=dev` before each release.
4. Replace `GOOGLE_TAG_ID`, `GOOGLE_ADS_CONVERSION_LABEL`, and `META_PIXEL_ID` in Netlify env vars (`VITE_GADS_ID`, `VITE_GADS_PURCHASE_LABEL`, `VITE_META_PIXEL_ID`) once ad accounts are active.
5. Fill company legal details (`TITULAR`, `NIF`, `DIRECCION`, `REGISTRO`) in `public/legal/{es,pt,en}.html` prior to paid traffic.

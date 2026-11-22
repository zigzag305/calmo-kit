# CalmoKit — emergency preparedness store (`calmokit.eu`)

> **Business context for humans and AI agents:** see [`AGENTS.md`](AGENTS.md) and [`business/`](business/README.md) — strategy, suppliers, products (links, costs, shipping), outreach and next actions.

A modern, bilingual (**EN / ES**) e-commerce storefront built with **React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Three.js**, combining:

- **Cinematic Full-Bleed Alpine Hero & Color-Adaptive Kit Switcher** with depth-of-field variant navigation and an instant Photo / 3D stage toggle.
- **Interactive Dark Tactical 3D Virtual Showroom (`CALMO.SYS`)** powered by Three.js with orbit controls, section bay camera presets, floating dock navigation, and hover price tooltips.
- **Minimalist Shoppable Catalog & Interactive 3D Product Detail Modal** supporting both **Curated Calmo Kit Bundles** and **Individual Vetted Partner / Dropshipped Gear**.
- **Situation Finder**, **Persistent Slide-Out Cart** with free-shipping progress bar, **USD / EUR currency toggle**, and an **Express Checkout** flow ready to wire to Stripe Payment Links or Shopify Storefront API.

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## Customizing Products & Dropshipping Suppliers

Edit [`src/data/products.ts`](src/data/products.ts) to:
- Add, remove, or reprice curated kits and individual dropshipped items.
- Update `fulfillment` (`'curated-kit'` or `'partner-gear'`), `brand`, `sku`, `variants`, `contents`, and `checkoutUrl`.
- Replace any product image inside `public/images/`.

To connect live payments:
- **Stripe Payment Links**: Add each product's Stripe Payment Link to `checkoutUrl` or wire a serverless Stripe Checkout session in [`src/components/CheckoutModal.tsx`](src/components/CheckoutModal.tsx).
- **Shopify Buy / Storefront API**: Connect your Shopify product handles and redirect the cart checkout button to Shopify's hosted checkout (great for automating dropshipping fulfillment with AutoDS, Zendrop, DSers, or CJdropshipping).

---

## Pushing to GitHub & deploying `calmokit.eu`

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Calmo Kit e-commerce storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/calmo-kit.git
git push -u origin main
```

### 2. Deploy

The site is hosted on **Netlify** (project `calmokit`, domain `calmokit.eu`). Every merge to `main` deploys automatically; build settings, redirects, headers and the public Supabase keys live in [`netlify.toml`](netlify.toml). DNS is at Namecheap (ALIAS `@` → `apex-loadbalancer.netlify.com`, CNAME `www` → `calmokit.netlify.app`).

Optional build env vars for tracking (set in Netlify → Site configuration → Environment variables): `VITE_GA4_ID`, `VITE_GADS_ID`, `VITE_GADS_PURCHASE_LABEL`, `VITE_GADS_ADD_TO_CART_LABEL`, `VITE_GADS_BEGIN_CHECKOUT_LABEL`. Nothing loads until a visitor accepts cookies.

Legal pages: edit `legal/*.md` or `legal/company.json`, then run `python3 scripts/legal/build_legal.py` and commit `public/legal/`.

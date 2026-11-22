# CALMO KIT — Emergency, Survival & Food Preparedness Storefront (`www.calmokit.com`)

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

## Pushing to GitHub & Connecting `www.calmokit.com`

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Calmo Kit e-commerce storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/calmo-kit.git
git push -u origin main
```

### 2. Deploy (Choose One)

#### Option A — Vercel (Recommended, Free)
1. Import your GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite** (Build: `npm run build`, Output: `dist`).
3. Go to **Project Settings → Domains** and add `www.calmokit.com` and `calmokit.com`.
4. Add the DNS records Vercel provides at your domain registrar (`A` record for `@` and `CNAME` for `www`).

#### Option B — GitHub Pages (Included Workflow)
1. In your GitHub repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` — the included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes automatically with `public/CNAME` (`www.calmokit.com`).
3. At your domain registrar, point `www` (`CNAME`) to `<your-username>.github.io` and apex `@` (`A` records) to GitHub Pages IPs (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).

# 07 · Operations, Tools & Accounts

> No passwords or secrets in this repo. Accounts below are listed only so agents know what exists.

## Email & domain
| Item | Detail |
|---|---|
| Domain | `calmokit.eu` (Namecheap). `www.calmokit.com` is in `public/CNAME` for the site — confirm ownership/primary domain. |
| Email | Google Workspace Business Starter — `matias@calmokit.eu` (trial until 6 Dec 2026, then ~€8.10/month). Alias `hola@calmokit.eu` planned. |
| DNS (verified) | MX `1 smtp.google.com` · TXT google-site-verification · SPF `v=spf1 include:_spf.google.com ~all` · DKIM `google._domainkey` · DMARC `_dmarc` `v=DMARC1; p=none; rua=mailto:matias@calmokit.eu` |
| Website DNS | Namecheap parking CNAME/redirect still on `www` — replace when pointing the site. **Keep the email records.** |
| AI access | Gmail connector on `matias@calmokit.eu` lets Claude read, draft and send. |

## Accounts created (22 Nov 2026)
| Platform | Account | Status |
|---|---|---|
| BigBuy | matias@calmokit.eu (self-employed, PT) | Created; no Wholesale Pack bought |
| CJdropshipping | matias@calmokit.eu | Created |
| Alibaba (buyer) | matias@calmokit.eu, company CalmoKit | Created; 3 inquiries sent; replies in Alibaba Messages + email |
| Drytech / Real Turmat | username `calmokit` | Retailer request pending approval |
| Liofilizado & Co | partnership form | Submitted |

## Tools
| Tool | Use |
|---|---|
| Claude Sheet "Europe Supplier List" (https://claude.ai/artifact/86SvkwLNmEKHPnTVUgGCCg) | Live supplier tracker: tabs *Europe suppliers*, *Questions to ask*, *China & agents*, *Products*. Columns include Status, Owner (Claude/Matias), Next action. |
| Apify | Scraping (Alibaba listings scraper, Google search scraper, web-fetch for domain/RDAP checks) |
| Gmail (Google Workspace) | Outreach drafts + scheduled sends |
| Claude in Chrome | Sign-ups and forms in the founder's browser (founder enters passwords, SMS codes, terms) |
| This repo | Website (React/Vite/Tailwind/Three.js, Supabase functions) + business docs |
| Cuyo Marketing | Paid ads, content, SEO (founder's agency) |

## Division of work
- **AI agent (Claude):** research, supplier emails, drafts, scheduling, sheet updates, reply tracking, product research, filling forms (founder clicks submit).
- **Matias:** passwords, SMS/2FA, CAPTCHAs, accepting terms, payments, Alibaba sends, final decisions, legal/tax.

## Website (this repo) — status after 22 Nov update
Done:
- EUR is the base currency and the default (USD only as a converted view, rate in `src/utils/currency.ts`).
- Real retail prices: 72H Crisis Pack €149 · Wilderness Field Kit €119 · Blackout Home Kit €249 · Food & Hydration Case €129 · water filter €34.90 · trauma/first-aid kit €39.90 · solar crank radio €39.90 · meal trio €29.90.
- Free shipping from €69 in PT/ES, otherwise €5.90 (cart, checkout and Stripe edge function match).
- Invented ratings/review counts and fake "compare-at" discounts removed (EU Omnibus); rating UI hides when there are no reviews. Only badge kept: "Launch edition" on the 72H pack.
- US-only NOAA wording replaced with AM/FM. "Ships worldwide" → "Ships from Europe".
- Each product in `src/data/products.ts` has an internal `sourcing` block (primary supplier, country, fallback, status).
- `index.html` JSON-LD and `public/llms.txt` updated (EUR, no fake aggregateRating).

Still open:
- Add PT language (site is EN/ES).
- Product contents/photos still generic: replace once MILITARY.EU / Liofilizado confirm SKUs.
- Security: `calmo-create-checkout` trusts prices sent by the browser. Look prices up server-side before going live.
- Domain: site uses `www.calmokit.com`; email uses `calmokit.eu`.
- PT/ES legal pages: terms, privacy (GDPR), returns (14-day withdrawal), shipping, contact.

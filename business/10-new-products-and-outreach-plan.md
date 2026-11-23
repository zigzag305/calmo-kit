# 10 · New products (Nov 2026) and the supplier approach

_Snapshot: 23 Nov 2026. Source: product research report (22 Nov), Amazon.es listings, supplier websites. Trade prices are estimates until suppliers answer._

## The 4 new products

All four are on the website as **"coming soon"**: visible, not orderable (`inStock: false` in `supabase/functions/_shared/calmoCatalog.ts`). Flip to `true` when a supplier confirms price and stock.

| Product (site name) | Retail | Est. margin | Why | First supplier | Backup |
|---|---|---|---|---|---|
| Home Safety Duo: CO alarm + fire blanket | €44.90 | 40–50% | Strongest demand: Amazon.es #1 CO detector has 1,152 reviews; ~125 CO deaths/yr in Spain (SEPAR), peak Oct–Feb | X-Sense Europe B.V. | By Demes (X-Sense Spain) |
| Keychain car escape tool | €19.90 | ~55% | Evergreen; Valencia DANA story; premium tier (resqme) has no Iberian reseller | resqme Europe SAS | Lifehammer Products (NL) |
| Dual-power LED lantern (rechargeable + AA) | €49.90 | 33–40% | Lighting was the top blackout search (+1,800% on IKA, Apr 2025) | Reiberco (Ledlenser ES/PT) | Relags GmbH (DE) |
| Compact stainless multitool | €79.90 | ~40% | Premium gift (Christmas, Father's Day 19 Mar) | J. Esteller (Leatherman ES/PT) | Leatherman Europe GmbH |

**Skip:** the V16 beacon (prices fell from €50 to under €8, the market is saturated). **Bundle only:** the fire blanket (€10–20 retail).

Rules for these listings:
- No brand names or brand photos on the site until we are an authorised reseller. The illustrations in `assets/illustrations/` are labelled "Imagen ilustrativa".
- Car escape tool: say it works on **tempered side windows, not laminated glass**.
- Multitool: tool copy only, never "defence"; blade < 11 cm; 18+ notice. Check Portugal's Lei 5/2006 before PT ads.
- CO alarm: EN 50291 + CE; include a one-page ES/PT guide (the top Amazon complaint is "no Spanish instructions").

## The approach to suppliers

### Principles
1. **One product = one first-choice supplier + one backup.** Never email both at once; the backup goes out only if the first says no or is silent for 5 working days.
2. **Max 3 cold emails a day** from matias@calmokit.eu, 40–70 min apart, recipient's business hours (domain reputation).
3. **Distributors over brands in Iberia.** Where a national distributor exists (Esteller, Reiberco, By Demes), they decide; the brand office is escalation only.
4. **Use one account for many products.** Esteller covers Leatherman + Katadyn + Trek'n Eat; MILITARY.EU covers kits, first aid, radio and meals.
5. **Ask the same 5 things every time:** dropship (blind?), trade price vs RRP, MOQ, delivery time/cost to ES/PT, GPSR docs + images. Questions live in the Excel "Questions to ask" tab.
6. **Reply the same day.** Every reply gets an answer within business hours, and the tracker is updated.

### Sequence
| When | What | Who |
|---|---|---|
| Mon 23 – Mon 30 Nov | 17 scheduled first emails (batches 1–3) go out automatically | Claude |
| Tue 24 Nov 11:20 | **X-Sense** (CO alarm, season-critical) | Claude, once Matias OKs |
| Tue 24 Nov | X-Sense partner form (needs company details) | Matias |
| Fri 27 Nov 11:40 | **J. Esteller** (Leatherman + Katadyn Iberia) — in time for Christmas | Claude, once Matias OKs |
| Fri 27 Nov | Review all replies: landed cost, margin, go/no-go for the 72H pack | Claude + Matias |
| Tue 1 Dec 10:30 / 11:40 | **resqme**, **Reiberco** (+ Bered at 09:30) | Claude, once Matias OKs |
| Wed 2 Dec | Backups (By Demes, Lifehammer, Relags, Leatherman EU) only where needed | Claude / Matias |
| Day 5 after each send | One short follow-up if no answer, then the backup | Claude |

### After a reply
1. Log terms in the Excel / live tracker (Status → Replied).
2. Build the landed cost: trade price + shipping to ES/PT + payment fees (~1.5–3%) + packaging; margin ≥ 40% or renegotiate/re-price.
3. Ask for one sample before switching a product to orderable.
4. Replace the illustration with licensed photos; add the real brand name if allowed.
5. Flip `inStock` to `true` in the catalog, merge, and add the product to the ad plan.

## Where things are
- Gmail drafts (not scheduled yet): X-Sense, J. Esteller, resqme, Reiberco.
- Excel: `business/data/calmokit-suppliers-products.xlsx` (new tab **Outreach calendar**).
- Live tracker: Claude Sheet https://claude.ai/artifact/86SvkwLNmEKHPnTVUgGCCg (same tabs).

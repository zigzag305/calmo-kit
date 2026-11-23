# 09 · Next Actions (as of 23 Nov 2026, morning)

Already done: accounts open on BigBuy, CJdropshipping, Alibaba; Liofilizado partnership form + Real Turmat retailer request sent; Risen replied; 15 supplier emails scheduled 23–30 Nov; website moved to EUR with real prices.

## Matias
- [x] Point the website domain to the host (keep email DNS records).
- [ ] **Deploy the 2 checkout functions** (`calmo-create-checkout`, `calmo-stripe-webhook`): PR #5 is live and needs them.
- [x] OK the 4 new supplier drafts — scheduled: X-Sense Tue 24 11:20, J. Esteller Fri 27 11:40, resqme Tue 1 Dec 10:30, Reiberco Tue 1 Dec 11:40.
- [ ] Submit the X-Sense partner form and the resqme reseller form (company details).
- [ ] Fill `legal/company.json` (company name, NIF, address, registry), create `hola@calmokit.eu`, create Stripe code CALMO10.
- [ ] Paste the Portuguese Safe Kit message (Gmail draft "[Para formulário / Instagram]") into their form + Instagram DM.
- [ ] Contabilista: CAE for online retail, VAT number / VIES / OSS, Art. 53 (unblocks Van Os, Katadyn, Ankorstore).
- [ ] Pay the Risen sample on Alibaba (Trade Assurance) once the quote arrives.
- [ ] Once site is live: sign up to Ankorstore, Faire, Spocket, Droplo, dropshippingXL, Syncee, Awin (Water-to-Go 107764).

## AI agent (Claude)
- [ ] Mon 23: watch replies from Noodspullen, MILITARY.EU, Convar. MILITARY.EU reply → ask B2B price + dropship for Brytzky, Badger, Helikon, first-aid kits, Mil-Tec, Adventure Menu.
- [ ] This week: post CJ sourcing request (branded 72h kit + quote to pre-stock 30–100 units in CJ Germany).
- [ ] Find Bered B2B email; draft batch 3 for Tue 1 Dec.
- [ ] Build landed-cost / margin table as soon as the first B2B price list arrives (MILITARY.EU or Risen).
- [ ] When suppliers confirm: replace generic product contents/photos on the site with the real SKUs.
- [x] Server-side price check in the Stripe checkout function (PR #5; needs deploy).
- [ ] New products (see 10-new-products-and-outreach-plan.md): track X-Sense, Esteller, resqme, Reiberco; backups only if needed; flip `inStock` when a supplier confirms.

## Decision points coming
1. Hero kit: EU-stocked (MILITARY.EU / Liofilizado / EmerPlan) vs own-brand OEM (Risen) — decide after B2B prices + sample.
2. Food line: Convar / Katadyn Trek'n Eat / Lyofood / Real Turmat — decide after terms.
3. Water line: LifeSaver (premium) vs Katadyn / LifeStraw.

# 02 · Strategy, Decisions & Roadmap

## Decisions already made
| Decision | Detail | Date |
|---|---|---|
| Brand | **CalmoKit**, domain `calmokit.eu` (email) | Nov 2026 |
| Europe first | Portugal + Spain first, EU next, US later | Nov 2026 |
| Start with dropshipping | €0 stock; move to wholesale once demand is proven | Nov 2026 |
| Email on Google Workspace | `matias@calmokit.eu` (not Namecheap mailbox) so AI agents can read/draft/send via the Gmail connector | Nov 2026 |
| Outreach positioning | We bring value to the supplier: paid ads (Cuyo Marketing), PT/ES localisation, customer support. Phase 1 dropship, Phase 2 wholesale. Never say "launching soon" or "you are on our shortlist". | Nov 2026 |
| Food from EU, kits from EU + China | Do not import food from China. Kits/first aid/radios can come from Chinese OEMs. | Nov 2026 |
| BigBuy is not core | BigBuy's "Emergency Kits" category is empty; only small first-aid kits. Don't pay for a Wholesale Pack. | 22 Nov 2026 |
| Delivery speed matters | Customers in PT/ES expect 1–5 days. China dropship (CJ) = ~2 weeks → only for add-ons/testing. Hero kit must ship from EU stock. | 22 Nov 2026 |

## Sourcing strategy (how we get product to customers)
1. **EU suppliers that dropship or hold stock in Iberia** (fastest, 1–5 days): Liofilizado & Co, MILITARY.EU (Poland, ships immediately), StockEtik (ES/PT warehouses), EmerPlan (Valencia), Noodspullen (NL), SOS Central (NL), Kits de Emergência / Safe Kit (PT).
2. **Premium EU brands (wholesale, better margin later)**: Katadyn + Trek'n Eat, Convar, Icon LifeSaver, LifeStraw, Real Turmat/Drytech, Lyofood, Expedition Foods, Nordic Prep, HELP BAG.
3. **China OEM for own-brand kit**: Risen Medical (replied), Yonoel, Emsrun/Rhino Rescue + backups. Buy samples → 100-unit order → sea freight → EU warehouse.
4. **Dropship agents for add-ons**: CJdropshipping (account created), NicheDropshipping, HyperSKU, EPROLO.

## Roadmap
### Phase 0 — Setup (DONE / in progress, Nov 2026)
- [x] Supplier research (US, EU, China) — Apify scrapes of Alibaba + Google (DE/NL/ES/PT/FR/IT/PL/SE)
- [x] Brand name + domain `calmokit.eu`
- [x] Google Workspace + DNS (MX, SPF, DKIM, DMARC) — verified
- [x] Supplier tracker (Claude Sheet) with owner + next action per supplier
- [x] Accounts: BigBuy, CJdropshipping, Alibaba (buyer), Drytech/Real Turmat retailer request
- [x] Outreach: 3 Alibaba inquiries sent, 16 supplier emails scheduled 23–30 Nov, Liofilizado partnership form sent
- [x] Website built (React/Vite, this repo) — needs domain pointing
- [ ] Point website domain (keep email DNS records intact)
- [ ] Contabilista: CAE for online retail, VAT (Art. 53 vs VIES/OSS)

### Phase 1 — Validate (Dec 2026 – Jan 2027)
- [ ] Pick 1 hero kit + 3–5 add-ons from suppliers that answer with dropship/fast EU delivery
- [ ] Order samples (Risen/Yonoel/Rhino Rescue + EU hero kit) for photos, quality check, content
- [ ] Localise site to **PT + ES**, EUR default, real prices, shipping/returns pages, legal pages (PT/ES)
- [ ] Stripe/checkout live; order routing to suppliers
- [ ] Paid ads test (Meta + Google) run by Cuyo Marketing; target CPA vs margin
- [ ] Sign up: Droplo, dropshippingXL, Syncee, Awin (Water-to-Go), HyperSKU (need live site)

### Phase 2 — Scale (2027)
- [ ] Wholesale orders from best EU suppliers (VAT number needed)
- [ ] Own-brand CalmoKit kit: 100–200 units from OEM, EU warehouse (CJ Germany or PT 3PL)
- [ ] B2B line: company/office emergency kits
- [ ] Expand to more EU countries

### Phase 3 — US
- [ ] US suppliers (My Patriot Supply, ReadyWise, Wise Company, Augason Farms, etc.), FDA rules for first aid (product code OHO)

## Risks & mitigations
| Risk | Mitigation |
|---|---|
| Premium EU brands refuse dropship | "Buy after customer pays"; small wholesale orders; EU dropship platforms |
| Slow delivery from China | Only add-ons from China; hero kit from EU stock |
| Lithium batteries (radios, power banks) shipping rules | Ask suppliers for battery-free versions or EU stock |
| First-aid compliance (EU MDR / CE) | Only kits with EU Declaration of Conformity (Risen has MDR DoC for RSF-001) |
| Food labelling (PT/ES language, allergens) | Buy food only from EU producers with compliant labels |
| New domain lands in spam | Max ~3 cold emails/day, plain text, no links, SPF/DKIM/DMARC set |
| No VAT number blocks wholesale | Contabilista; register for VIES/OSS when needed |

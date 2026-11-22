# AGENTS.md — CalmoKit

You are working on **CalmoKit**: a premium emergency-preparedness e-commerce brand (72-hour kits, long-shelf-life food, water filtration) selling in **Portugal and Spain first**, then the EU, then the US. Founder: Matias Ibañez (`matias@calmokit.eu`).

## Read first
- Business context: [`business/README.md`](business/README.md) — overview, strategy, suppliers, products (links, costs, shipping, delivery), outreach templates, operations, compliance, next actions.
- Live supplier tracker (source of truth for statuses): Claude Sheet https://claude.ai/artifact/86SvkwLNmEKHPnTVUgGCCg

## This repository
- Website: React + TypeScript + Vite + Tailwind + Three.js. Products in `src/data/products.ts`, translations in `src/i18n/translations.ts`, Supabase functions in `supabase/`.
- Marketing: `marketing/`, promo videos in `promo-video*/` (each has its own AGENTS.md).

## Working rules
- Business comms always signed "Matias Ibañez, Founder, CalmoKit". Never use the nickname "Rush".
- Supplier emails: follow `business/06-outreach-playbook.md` (value-first, dropship Phase 1 → wholesale Phase 2, plain text, ≤140 words, max ~3 cold emails/day).
- Never commit secrets, passwords, API keys, personal phone numbers or tax IDs. This repo may be public.
- When statuses change, update the Claude Sheet and the matching file in `business/` (bump the snapshot date).
- Website copy should target PT + ES customers, EUR pricing, calm (not fear-based) tone.

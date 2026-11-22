/**
 * Single source of truth for what CalmoKit sells and what it costs.
 *
 * Both the website (src/data/products.ts reads prices and SKUs from here) and
 * the checkout Edge Function (calmo-create-checkout) import this file, so the
 * price a customer sees is the price Stripe charges.
 *
 * Why it exists: checkout used to trust the `priceEur` sent by the browser, so
 * anyone could edit the request and pay €1 for a €149 kit. The function now
 * ignores client prices and looks every item up here.
 *
 * Plain TypeScript with no imports, so it runs in Deno and in Vite.
 */
export interface CatalogEntry {
  sku: string;
  /** Retail price in EUR, VAT included. */
  priceEur: number;
  /** Line-item name shown on the Stripe page and receipt (Spanish). */
  name: string;
  /** Allowed colour/version ids. */
  variants: string[];
  inStock: boolean;
}

export const CALMO_CATALOG: Record<string, CatalogEntry> = {
  'calmo-crisis-72h': {
    sku: 'CK-72H-FAM',
    priceEur: 149,
    name: 'Mochila Familiar 72H',
    variants: ['ember', 'obsidian', 'olive'],
    inStock: true,
  },
  'calmo-wilderness-pro': {
    sku: 'CK-CAR-PRO',
    priceEur: 119,
    name: 'Kit Coche y Exterior',
    variants: ['pine', 'coyote', 'charcoal'],
    inStock: true,
  },
  'calmo-blackout-home': {
    sku: 'CK-BLK-PWR',
    priceEur: 249,
    name: 'Kit Apagón y Energía Hogar',
    variants: ['slate', 'titanium'],
    inStock: true,
  },
  'calmo-food-hydration': {
    sku: 'CK-FOOD-25Y',
    priceEur: 129,
    name: 'Maletín Comida y Agua',
    variants: ['bronze', 'olive'],
    inStock: true,
  },
  'gear-water-filter': {
    sku: 'PG-HYD-5000',
    priceEur: 34.9,
    name: 'Filtro Portátil de Agua + Bolsa 1L',
    variants: ['graphite', 'cobalt'],
    inStock: true,
  },
  'gear-trauma-kit': {
    sku: 'PG-MED-CE85',
    priceEur: 39.9,
    name: 'Botiquín Impermeable EVA (CE)',
    variants: ['signal-red', 'stealth-black'],
    inStock: true,
  },
  'gear-weather-radio': {
    sku: 'PG-RAD-EU4',
    priceEur: 39.9,
    name: 'Radio Solar y Dinamo de Emergencia',
    variants: ['graphite', 'rescue-orange'],
    inStock: true,
  },
  'gear-meal-pack': {
    sku: 'PG-FOOD-EU3',
    priceEur: 29.9,
    name: 'Pack 3 Comidas Liofilizadas (UE)',
    variants: ['classic', 'plant'],
    inStock: true,
  },
};

/** Free shipping from this subtotal (EUR, VAT included). */
export const FREE_SHIPPING_FROM_EUR = 69;
/** Flat shipping below that. */
export const SHIPPING_EUR = 5.9;

/**
 * Countries we deliver to. Stripe can only restrict by country, so the
 * terms of sale exclude the Canary Islands, Ceuta, Melilla, Madeira and the
 * Azores (customs/extra cost); the webhook flags those postcodes.
 */
export const SHIPPING_COUNTRIES = ['ES', 'PT'] as const;

/** Postcodes we cannot serve yet: Canarias 35/38, Ceuta 51, Melilla 52, PT islands 9xxx. */
export function isExcludedPostcode(country: string, postcode: string): boolean {
  const pc = (postcode || '').trim();
  if (country === 'ES') return /^(35|38|51|52)\d{3}$/.test(pc);
  if (country === 'PT') return /^9\d{3}(-\d{3})?$/.test(pc);
  return false;
}

export function catalogPrice(id: string): number {
  const entry = CALMO_CATALOG[id];
  if (!entry) throw new Error(`Unknown catalog id: ${id}`);
  return entry.priceEur;
}

export function catalogSku(id: string): string {
  const entry = CALMO_CATALOG[id];
  if (!entry) throw new Error(`Unknown catalog id: ${id}`);
  return entry.sku;
}

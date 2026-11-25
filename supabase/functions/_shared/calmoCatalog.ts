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
    inStock: false,
  },
  'calmo-wilderness-pro': {
    sku: 'CK-CAR-PRO',
    priceEur: 119,
    name: 'Kit Coche y Exterior',
    variants: ['pine', 'coyote', 'charcoal'],
    inStock: false,
  },
  'calmo-blackout-home': {
    sku: 'CK-BLK-PWR',
    priceEur: 249,
    name: 'Kit Apagón y Energía Hogar',
    variants: ['slate', 'titanium'],
    inStock: false,
  },
  'calmo-food-hydration': {
    sku: 'CK-FOOD-25Y',
    priceEur: 129,
    name: 'Maletín Comida y Agua',
    variants: ['bronze', 'olive'],
    inStock: false,
  },
  'gear-water-filter': {
    sku: 'PG-HYD-5000',
    priceEur: 34.9,
    name: 'Filtro Portátil de Agua + Bolsa 1L',
    variants: ['graphite', 'cobalt'],
    inStock: false,
  },
  'gear-trauma-kit': {
    sku: 'PG-MED-CE85',
    priceEur: 39.9,
    name: 'Botiquín Impermeable EVA (CE)',
    variants: ['signal-red', 'stealth-black'],
    inStock: false,
  },
  // Hero product (25 Nov 2026): radio + lantern, both from CJdropshipping (China, 13–16 days).
  // CJ order = radio CJYD197457505EV (colour 086, European Version) + lantern CJSD316113501AZ (D83-1).
  'calmo-blackout-essentials': {
    sku: 'CK-APAGON-ESS',
    priceEur: 69,
    name: 'Kit Apagón Esencial: Radio Solar + Farol LED',
    variants: ['standard'],
    inStock: true,
  },
  // Sold inside the kit only; on its own it can't compete on price.
  'gear-weather-radio': {
    sku: 'CJYD197457505EV',
    priceEur: 44.9,
    name: 'Radio de Emergencia Solar y Dinamo',
    variants: ['red'],
    inStock: false,
  },
  'gear-meal-pack': {
    sku: 'PG-FOOD-EU3',
    priceEur: 29.9,
    name: 'Pack 3 Comidas Liofilizadas (UE)',
    variants: ['classic', 'plant'],
    inStock: false,
  },
  // New lines (Nov 2026): not orderable until a supplier confirms (inStock: false).
  'gear-home-safety-duo': {
    sku: 'PG-HOME-CODUO',
    priceEur: 44.9,
    name: 'Dúo Seguridad Hogar: Detector de CO + Manta Ignífuga',
    variants: ['standard'],
    inStock: false,
  },
  'gear-car-escape-tool': {
    sku: 'PG-CAR-ESCAPE',
    priceEur: 19.9,
    name: 'Rompecristales y Cortacinturones de Llavero',
    variants: ['standard'],
    inStock: false,
  },
  'gear-dual-power-lantern': {
    sku: 'PG-LGT-DUAL',
    priceEur: 49.9,
    name: 'Farol LED Doble Energía (Recargable + Pila AA)',
    variants: ['standard'],
    inStock: false,
  },
  'gear-compact-multitool': {
    sku: 'PG-TOOL-MULTI',
    priceEur: 79.9,
    name: 'Multiherramienta Compacta de Acero Inoxidable',
    variants: ['standard'],
    inStock: false,
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

/** Postcodes we cannot serve yet: Baleares 07, Canarias 35/38, Ceuta 51, Melilla 52, PT islands 9xxx. */
export function isExcludedPostcode(country: string, postcode: string): boolean {
  const pc = (postcode || '').trim();
  if (country === 'ES') return /^(07|35|38|51|52)\d{3}$/.test(pc);
  if (country === 'PT') return /^9\d{3}(-\d{3})?$/.test(pc);
  return false;
}

export function catalogPrice(id: string): number {
  const entry = CALMO_CATALOG[id];
  if (!entry) throw new Error(`Unknown catalog id: ${id}`);
  return entry.priceEur;
}

/** Whether the item can be ordered now (false = "coming soon"). */
export function catalogInStock(id: string): boolean {
  return Boolean(CALMO_CATALOG[id]?.inStock);
}

export function catalogSku(id: string): string {
  const entry = CALMO_CATALOG[id];
  if (!entry) throw new Error(`Unknown catalog id: ${id}`);
  return entry.sku;
}

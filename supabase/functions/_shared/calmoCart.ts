/**
 * Rebuilds a checkout cart from what the browser sent, using only catalog
 * prices. Pure (no Deno/network), so it is unit-tested with tsx:
 *   npx tsx supabase/functions/_shared/calmoCart_test.ts
 */
import {
  CALMO_CATALOG,
  FREE_SHIPPING_FROM_EUR,
  SHIPPING_EUR,
} from './calmoCatalog.ts';

export const MAX_LINES = 20;
export const MAX_QTY = 10;

export interface CartLine {
  id: string;
  sku: string;
  name: string;
  variantId: string;
  variantLabel: string;
  unitCents: number;
  quantity: number;
  /** Site-relative path of one of our own photos, or null. */
  image: string | null;
}

export type CartResult =
  | { ok: true; lines: CartLine[]; subtotalCents: number; shippingCents: number }
  | { ok: false; error: string };

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export function buildCart(rawItems: unknown): CartResult {
  const items = Array.isArray(rawItems) ? rawItems : [];
  if (!items.length) return { ok: false, error: 'No items provided for checkout' };
  if (items.length > MAX_LINES) return { ok: false, error: 'Too many items' };

  const lines: CartLine[] = [];
  for (const raw of items as Record<string, unknown>[]) {
    const id = str(raw?.id, 80);
    const entry = Object.prototype.hasOwnProperty.call(CALMO_CATALOG, id)
      ? CALMO_CATALOG[id]
      : undefined;
    if (!entry || !entry.inStock) {
      return { ok: false, error: `Product not available: ${id || '?'}` };
    }
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return { ok: false, error: `Invalid quantity for ${id}` };
    }
    const variantId = str(raw.variantId, 40) || entry.variants[0];
    if (!entry.variants.includes(variantId)) {
      return { ok: false, error: `Invalid option for ${id}` };
    }
    const image = str(raw.image, 200);
    const safeImage =
      /^\.?\/images\/[\w\-/]+\.(jpg|jpeg|png|webp)$/i.test(image) && !image.includes('..')
        ? image.replace(/^\./, '')
        : null;
    lines.push({
      id,
      sku: entry.sku,
      name: entry.name,
      variantId,
      variantLabel: str(raw.variant, 40),
      unitCents: Math.round(entry.priceEur * 100),
      quantity,
      image: safeImage,
    });
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
  const shippingCents =
    subtotalCents >= FREE_SHIPPING_FROM_EUR * 100 ? 0 : Math.round(SHIPPING_EUR * 100);
  return { ok: true, lines, subtotalCents, shippingCents };
}

import { productJpg } from './images';
import { CartItem, Currency, Lang } from '../types';

const SUPABASE_URL = import.meta.env.VITE_CALMO_SUPABASE_URL as
  | string
  | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_CALMO_SUPABASE_ANON_KEY as
  | string
  | undefined;

export function isCalmoBackendConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export interface CreateCheckoutResponse {
  orderRef: string;
  url: string | null;
  mode: 'stripe' | 'order-recorded' | 'preview';
  totalCents?: number;
}

/**
 * Calls the isolated `calmo-create-checkout` Edge Function.
 * Never initializes Supabase Auth or touches other projects' tables.
 */
export async function submitCalmoCheckout(params: {
  items: CartItem[];
  currency: Currency;
  lang: Lang;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };
}): Promise<CreateCheckoutResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      orderRef: `CK-${Math.floor(100000 + Math.random() * 900000)}`,
      url: null,
      mode: 'preview',
    };
  }

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/calmo-create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      // Prices are looked up on the server (supabase/functions/_shared/calmoCatalog.ts);
      // the browser only says what and how many.
      body: JSON.stringify({
        lang: params.lang,
        customer: params.customer,
        items: params.items.map((i) => ({
          id: i.product.id,
          variantId: i.variantId,
          variant: i.product.variants.find((v) => v.id === i.variantId)?.name[
            params.lang
          ],
          quantity: i.quantity,
          // Stripe gets the JPEG twin of the WebP product image.
          image: productJpg(i.product.image),
        })),
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Checkout request failed');
  }

  return (await response.json()) as CreateCheckoutResponse;
}

/**
 * Calls the isolated `calmo-submit-lead` Edge Function for newsletter / inquiries.
 */
export async function submitCalmoLead(params: {
  email: string;
  name?: string;
  message?: string;
  lang: Lang;
  leadType?: 'newsletter' | 'contact' | 'custom-kit';
}): Promise<{ success: boolean; mode: 'live' | 'preview' }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: true, mode: 'preview' };
  }

  const response = await fetch(
    `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/calmo-submit-lead`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Lead submission failed');
  }

  return { success: true, mode: 'live' };
}

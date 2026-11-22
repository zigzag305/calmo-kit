/**
 * Google Analytics 4 + Google Ads conversion tracking, with Consent Mode v2.
 *
 * Basic consent mode: gtag.js is NOT loaded until the visitor accepts
 * analytics or ads cookies, so a visitor who declines sends nothing to Google.
 * Events fired before consent are dropped, not queued.
 *
 * IDs come from build env vars (set them in netlify.toml or the Netlify UI).
 * With none set, every function here is a no-op:
 *   VITE_GA4_ID                    G-XXXXXXXXXX
 *   VITE_GADS_ID                   AW-XXXXXXXXXX
 *   VITE_GADS_PURCHASE_LABEL       conversion label for "Purchase"
 *   VITE_GADS_ADD_TO_CART_LABEL    conversion label for "Add to cart" (optional)
 *   VITE_GADS_BEGIN_CHECKOUT_LABEL conversion label for "Begin checkout" (optional)
 */
import { CartItem, Product } from '../types';
import { ConsentState, onConsentChange, readConsent } from './consent';

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const ADS_ID = import.meta.env.VITE_GADS_ID as string | undefined;
const LABELS = {
  purchase: import.meta.env.VITE_GADS_PURCHASE_LABEL as string | undefined,
  add_to_cart: import.meta.env.VITE_GADS_ADD_TO_CART_LABEL as string | undefined,
  begin_checkout: import.meta.env.VITE_GADS_BEGIN_CHECKOUT_LABEL as string | undefined,
};

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let loaded = false;
let consent: ConsentState | null = null;

const granted = (yes: boolean) => (yes ? 'granted' : 'denied');

function load(state: ConsentState): void {
  if (loaded || (!GA4_ID && !ADS_ID)) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the `arguments` object itself, not an array copy.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const g = window.gtag;
  g('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  g('consent', 'update', {
    analytics_storage: granted(state.analytics),
    ad_storage: granted(state.ads),
    ad_user_data: granted(state.ads),
    ad_personalization: granted(state.ads),
  });
  g('js', new Date());
  if (GA4_ID && state.analytics) g('config', GA4_ID, { anonymize_ip: true });
  if (ADS_ID && state.ads) g('config', ADS_ID);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID || ADS_ID || '')}`;
  document.head.appendChild(s);
}

function apply(state: ConsentState): void {
  consent = state;
  if (!state.analytics && !state.ads) {
    // Withdrawn after loading: tell gtag to stop using cookies.
    if (loaded && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
    return;
  }
  if (!loaded) {
    load(state);
  } else if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted(state.analytics),
      ad_storage: granted(state.ads),
      ad_user_data: granted(state.ads),
      ad_personalization: granted(state.ads),
    });
  }
}

/** Call once at startup. */
export function initAnalytics(): void {
  const saved = readConsent();
  if (saved) apply(saved);
  onConsentChange(apply);
}

export function analyticsConfigured(): boolean {
  return Boolean(GA4_ID || ADS_ID);
}

const toItem = (product: Product, quantity = 1, variantId?: string) => ({
  item_id: product.sku,
  item_name: product.name.es,
  item_variant: variantId,
  item_category: product.category,
  price: product.priceEur,
  quantity,
});

function send(event: string, params: Record<string, unknown>, adsLabel?: string): void {
  if (!loaded || !window.gtag || !consent) return;
  if (consent.analytics && GA4_ID) window.gtag('event', event, params);
  if (consent.ads && ADS_ID && adsLabel) {
    window.gtag('event', 'conversion', {
      send_to: `${ADS_ID}/${adsLabel}`,
      value: params.value,
      currency: 'EUR',
      transaction_id: params.transaction_id,
    });
  }
}

export function trackViewItem(product: Product): void {
  send('view_item', { currency: 'EUR', value: product.priceEur, items: [toItem(product)] });
}

export function trackAddToCart(product: Product, quantity: number, variantId?: string): void {
  send(
    'add_to_cart',
    {
      currency: 'EUR',
      value: Math.round(product.priceEur * quantity * 100) / 100,
      items: [toItem(product, quantity, variantId)],
    },
    LABELS.add_to_cart,
  );
}

const cartValue = (items: CartItem[]) =>
  Math.round(items.reduce((s, i) => s + i.product.priceEur * i.quantity, 0) * 100) / 100;

export function trackBeginCheckout(items: CartItem[]): void {
  send(
    'begin_checkout',
    {
      currency: 'EUR',
      value: cartValue(items),
      items: items.map((i) => toItem(i.product, i.quantity, i.variantId)),
    },
    LABELS.begin_checkout,
  );
}

/* Purchase: the cart is saved just before the Stripe redirect, and reported
   once when Stripe sends the shopper back with ?checkout=success&ref=… */
const PENDING_KEY = 'calmo_pending_order_v1';

export function rememberPendingOrder(orderRef: string, items: CartItem[], totalCents?: number): void {
  try {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        ref: orderRef,
        value: totalCents != null ? totalCents / 100 : cartValue(items),
        items: items.map((i) => toItem(i.product, i.quantity, i.variantId)),
      }),
    );
  } catch {
    // Storage unavailable: the purchase just won't be reported.
  }
}

export function trackPurchaseOnReturn(orderRef: string): void {
  let pending: { ref: string; value: number; items: unknown[] } | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    return;
  }
  // Only report the order this browser actually started (no double counting
  // on reload, no fake purchases from a hand-typed URL).
  if (!pending || pending.ref !== orderRef) return;
  send(
    'purchase',
    { transaction_id: orderRef, currency: 'EUR', value: pending.value, items: pending.items },
    LABELS.purchase,
  );
}

/**
 * Google Tag (Google Ads) + Meta Pixel conversion tracking, with consent gating.
 *
 * Strict consent mode: neither gtag.js nor Meta Pixel (fbevents.js) loads or
 * fires until the visitor grants consent. Events before consent are dropped.
 *
 * Replace placeholders via build env vars or directly here:
 *   VITE_GADS_ID                   GOOGLE_TAG_ID
 *   VITE_GADS_PURCHASE_LABEL       GOOGLE_ADS_CONVERSION_LABEL
 *   VITE_META_PIXEL_ID             META_PIXEL_ID
 */
import { CartItem, Product } from '../types';
import { ConsentState, onConsentChange, readConsent } from './consent';

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const GOOGLE_TAG_ID =
  (import.meta.env.VITE_GADS_ID as string | undefined) || 'GOOGLE_TAG_ID';
const GOOGLE_ADS_CONVERSION_LABEL =
  (import.meta.env.VITE_GADS_PURCHASE_LABEL as string | undefined) ||
  'GOOGLE_ADS_CONVERSION_LABEL';
const META_PIXEL_ID =
  (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || 'META_PIXEL_ID';

const LABELS = {
  purchase: GOOGLE_ADS_CONVERSION_LABEL,
  add_to_cart: import.meta.env.VITE_GADS_ADD_TO_CART_LABEL as string | undefined,
  begin_checkout: import.meta.env.VITE_GADS_BEGIN_CHECKOUT_LABEL as string | undefined,
};

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let googleLoaded = false;
let metaLoaded = false;
let consent: ConsentState | null = null;

const granted = (yes: boolean) => (yes ? 'granted' : 'denied');

function loadGoogle(state: ConsentState): void {
  if (googleLoaded || (!GA4_ID && !GOOGLE_TAG_ID)) return;
  googleLoaded = true;
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
  if (GOOGLE_TAG_ID && state.ads) g('config', GOOGLE_TAG_ID);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GOOGLE_TAG_ID || GA4_ID || ''
  )}`;
  document.head.appendChild(s);
}

function loadMetaPixel(): void {
  if (metaLoaded || !META_PIXEL_ID) return;
  metaLoaded = true;
  if (!window.fbq) {
    const n: Fbq = function fbq(...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue!.push(args);
      }
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    window.fbq = n;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function apply(state: ConsentState): void {
  consent = state;
  if (!state.analytics && !state.ads) {
    if (googleLoaded && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
    return;
  }
  if (!googleLoaded) {
    loadGoogle(state);
  } else if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted(state.analytics),
      ad_storage: granted(state.ads),
      ad_user_data: granted(state.ads),
      ad_personalization: granted(state.ads),
    });
  }
  if (state.ads && !metaLoaded) {
    loadMetaPixel();
  }
}

/** Call once at startup. */
export function initAnalytics(): void {
  const saved = readConsent();
  if (saved) apply(saved);
  onConsentChange(apply);
}

export function analyticsConfigured(): boolean {
  return Boolean(GA4_ID || GOOGLE_TAG_ID || META_PIXEL_ID);
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
  if (!consent) return;
  if (googleLoaded && window.gtag) {
    if (consent.analytics && GA4_ID) window.gtag('event', event, params);
    if (consent.ads && GOOGLE_TAG_ID && adsLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${GOOGLE_TAG_ID}/${adsLabel}`,
        value: params.value,
        currency: 'EUR',
        transaction_id: params.transaction_id,
      });
    }
  }
  if (metaLoaded && window.fbq && consent.ads) {
    if (event === 'view_item') {
      window.fbq('track', 'ViewContent', { value: params.value, currency: 'EUR' });
    } else if (event === 'add_to_cart') {
      window.fbq('track', 'AddToCart', { value: params.value, currency: 'EUR' });
    } else if (event === 'begin_checkout') {
      window.fbq('track', 'InitiateCheckout', { value: params.value, currency: 'EUR' });
    } else if (event === 'purchase') {
      window.fbq('track', 'Purchase', {
        value: params.value,
        currency: 'EUR',
      });
    }
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

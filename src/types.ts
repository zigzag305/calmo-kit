export type Lang = 'pt' | 'es' | 'en';
export type Currency = 'EUR' | 'USD';

export type ProductCategory =
  | 'kits'
  | 'food-water'
  | 'survival'
  | 'power-med';

export type FulfillmentType = 'curated-kit' | 'partner-gear';

export type Model3DType =
  | 'crisis-pack'
  | 'wilderness-pack'
  | 'blackout-station'
  | 'food-case'
  | 'water-filter'
  | 'trauma-kit'
  | 'weather-radio'
  | 'meal-pouches';

export interface LocalizedText {
  pt: string;
  es: string;
  en: string;
}

export interface ProductVariant {
  id: string;
  name: LocalizedText;
  hex: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  category: ProductCategory;
  fulfillment: FulfillmentType;
  brand: string;
  /** Optional supplier / Stripe / Shopify direct checkout link for dropshipping or Payment Links */
  checkoutUrl?: string;
  name: LocalizedText;
  shortTagline: LocalizedText;
  description: LocalizedText;
  /** Retail price in EUR (base currency). */
  priceEur: number;
  /** Only set when a real previous price existed (EU Omnibus rules). */
  compareAtEur?: number;
  rating: number;
  reviewCount: number;
  badge?: LocalizedText;
  image: string;
  /** True while the image is a CalmoKit illustration, not a photo of the real item. */
  illustration?: boolean;
  /** Whether the photo is a dark moody studio shot vs clean light #F5F5F7 studio shot */
  imageTheme: 'dark' | 'light';
  /** Cinematic showcase gradient theme (used for flagship kits in Section 2) */
  showcase?: {
    order: string;
    bgFrom: string;
    bgVia: string;
    bgTo: string;
    accentHex: string;
    scenarios: LocalizedText[];
    highlightMetric: LocalizedText;
  };
  /** Procedural 3D model. Products without one show only their image. */
  model3D?: {
    type: Model3DType;
    primaryColor: string;
    accentColor: string;
    secondaryColor: string;
  };
  variants: ProductVariant[];
  contents?: LocalizedText[];
  specs: {
    label: LocalizedText;
    value: LocalizedText;
  }[];
  inStock: boolean;
  featured?: boolean;
  /** Internal sourcing notes (not shown to customers). See business/05-products-sourcing.md */
  sourcing?: {
    primary: string;
    country: string;
    fallback?: string;
    status: 'confirmed' | 'pending-terms' | 'searching';
  };
}

export interface CartItem {
  product: Product;
  variantId: string;
  quantity: number;
}

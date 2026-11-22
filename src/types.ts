export type Lang = 'en' | 'es';
export type Currency = 'USD' | 'EUR';

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
  en: string;
  es: string;
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
  priceUsd: number;
  compareAtUsd?: number;
  rating: number;
  reviewCount: number;
  badge?: LocalizedText;
  image: string;
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
  model3D: {
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
}

export interface CartItem {
  product: Product;
  variantId: string;
  quantity: number;
}

import { Currency } from '../types';

/** All catalogue prices are stored in EUR (primary market: Portugal + Spain). */
const USD_PER_EUR = 1.09;

import { FREE_SHIPPING_FROM_EUR, SHIPPING_EUR } from '../../supabase/functions/_shared/calmoCatalog';

/** Same numbers the checkout function charges (shared catalog). */
export const FREE_SHIPPING_EUR = FREE_SHIPPING_FROM_EUR;
export const FLAT_SHIPPING_EUR = SHIPPING_EUR;

export function formatPrice(amountEur: number, currency: Currency): string {
  const value = currency === 'USD' ? amountEur * USD_PER_EUR : amountEur;
  return new Intl.NumberFormat(currency === 'EUR' ? 'pt-PT' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Returns the free-shipping threshold in EUR (formatPrice converts for display). */
export function getFreeShippingThreshold(): number {
  return FREE_SHIPPING_EUR;
}

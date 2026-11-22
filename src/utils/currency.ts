import { Currency } from '../types';

const EUR_RATE = 0.92;

export function formatPrice(amountUsd: number, currency: Currency): string {
  const value = currency === 'EUR' ? amountUsd * EUR_RATE : amountUsd;
  return new Intl.NumberFormat(currency === 'EUR' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getFreeShippingThreshold(currency: Currency): number {
  return currency === 'EUR' ? 90 : 99;
}

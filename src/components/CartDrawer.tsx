import React from 'react';
import {
  X,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { CartItem, Currency, Lang, Product } from '../types';
import {
  formatPrice,
  getFreeShippingThreshold,
  FREE_SHIPPING_EUR,
  FLAT_SHIPPING_EUR,
} from '../utils/currency';
import { productSrcSet } from '../lib/images';
import { getCopy } from '../i18n/translations';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  upsellProduct?: Product;
  lang: Lang;
  currency: Currency;
  onClose: () => void;
  onUpdateQty: (productId: string, variantId: string, delta: number) => void;
  onRemove: (productId: string, variantId: string) => void;
  onAddUpsell: (product: Product) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  upsellProduct,
  lang,
  currency,
  onClose,
  onUpdateQty,
  onRemove,
  onAddUpsell,
  onProceedToCheckout,
}) => {
  const copy = getCopy(lang);
  if (!open) return null;

  const subtotalEur = items.reduce(
    (sum, item) => sum + item.product.priceEur * item.quantity,
    0
  );
  const freeThresholdEur = FREE_SHIPPING_EUR;
  const remainingEur = Math.max(0, freeThresholdEur - subtotalEur);
  const progressPct = Math.min(100, (subtotalEur / freeThresholdEur) * 100);
  const shippingEur = subtotalEur === 0 || remainingEur === 0 ? 0 : FLAT_SHIPPING_EUR;
  const totalEur = subtotalEur + shippingEur;

  const showUpsell =
    upsellProduct && !items.some((i) => i.product.id === upsellProduct.id);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md bg-white text-stone-950 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-stone-950" />
            <h2 className="font-display text-lg font-bold">{copy.cart.title}</h2>
            <span className="rounded-full bg-stone-950 text-white text-xs font-bold px-2 py-0.5">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-950 transition cursor-pointer"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 py-3.5 bg-[#F4F1EA] border-b border-stone-200/80">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {remainingEur === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  {copy.cart.freeShippingUnlocked}
                </span>
              ) : (
                <span>
                  <strong className="text-stone-950">
                    {formatPrice(remainingEur, currency)}
                  </strong>{' '}
                  {copy.cart.freeShippingRemaining} (
                  {formatPrice(getFreeShippingThreshold(), currency)})
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                {copy.cart.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-stone-500 max-w-xs">
                {copy.cart.emptyDesc}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-stone-950 text-white px-6 py-2.5 text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
              >
                {copy.cart.emptyCta}
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => {
                const variant = item.product.variants.find(
                  (v) => v.id === item.variantId
                );
                return (
                  <div
                    key={`${item.product.id}-${item.variantId}`}
                    className="flex gap-4 pb-4 border-b border-stone-100"
                  >
                    <img
                      src={item.product.image}
                      srcSet={productSrcSet(item.product.image)}
                      sizes="120px"
                      loading="lazy"
                      decoding="async"
                      alt={item.product.name[lang]}
                      className="w-20 h-20 rounded-xl object-cover bg-[#F4F1EA] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display text-sm font-bold text-stone-950 leading-tight">
                            {item.product.name[lang]}
                          </h4>
                          {variant && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {variant.name[lang]}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onRemove(item.product.id, item.variantId)
                          }
                          className="text-stone-400 hover:text-red-500 transition cursor-pointer p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-stone-200 bg-[#F4F1EA]">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.product.id, item.variantId, -1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-950 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.product.id, item.variantId, 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-950 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-display text-sm font-bold text-stone-950">
                          {formatPrice(
                            item.product.priceEur * item.quantity,
                            currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Smart Emergency Upsell */}
              {showUpsell && upsellProduct && (
                <div className="rounded-2xl bg-[#F4F1EA] border border-stone-200/80 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {copy.cart.upsellTitle}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={upsellProduct.image}
                      srcSet={productSrcSet(upsellProduct.image)}
                      sizes="120px"
                      loading="lazy"
                      decoding="async"
                      alt={upsellProduct.name[lang]}
                      className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {upsellProduct.name[lang]}
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatPrice(upsellProduct.priceEur, currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddUpsell(upsellProduct)}
                      className="rounded-full bg-stone-950 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-[#0B6E4F] transition cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Totals & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{copy.cart.subtotal}</span>
                <span>{formatPrice(subtotalEur, currency)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{copy.cart.shipping}</span>
                <span className={shippingEur === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {shippingEur === 0
                    ? copy.cart.free
                    : formatPrice(shippingEur, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
                <span>{copy.cart.total}</span>
                <span>{formatPrice(totalEur, currency)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 hover:bg-stone-800 text-white py-3.5 px-6 text-sm font-bold transition shadow-lg cursor-pointer"
            >
              {copy.cart.checkoutCta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

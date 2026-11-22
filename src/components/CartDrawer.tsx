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
import { formatPrice, getFreeShippingThreshold } from '../utils/currency';
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

  const subtotalUsd = items.reduce(
    (sum, item) => sum + item.product.priceUsd * item.quantity,
    0
  );
  const freeThresholdUsd = 99;
  const remainingUsd = Math.max(0, freeThresholdUsd - subtotalUsd);
  const progressPct = Math.min(100, (subtotalUsd / freeThresholdUsd) * 100);
  const shippingUsd = subtotalUsd === 0 || remainingUsd === 0 ? 0 : 12;
  const totalUsd = subtotalUsd + shippingUsd;

  const showUpsell =
    upsellProduct && !items.some((i) => i.product.id === upsellProduct.id);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md bg-white text-slate-950 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-slate-950" />
            <h2 className="font-display text-lg font-bold">{copy.cart.title}</h2>
            <span className="rounded-full bg-slate-950 text-white font-mono text-xs font-bold px-2 py-0.5">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-950 transition cursor-pointer"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 py-3.5 bg-[#F5F5F7] border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              {remainingUsd === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  {copy.cart.freeShippingUnlocked}
                </span>
              ) : (
                <span>
                  <strong className="text-slate-950">
                    {formatPrice(remainingUsd, currency)}
                  </strong>{' '}
                  {copy.cart.freeShippingRemaining} (
                  {formatPrice(getFreeShippingThreshold(currency), currency)})
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
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
              <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {copy.cart.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs">
                {copy.cart.emptyDesc}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full bg-slate-950 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
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
                    className="flex gap-4 pb-4 border-b border-slate-100"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name[lang]}
                      className="w-20 h-20 rounded-xl object-cover bg-[#F5F5F7] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display text-sm font-bold text-slate-950 leading-tight">
                            {item.product.name[lang]}
                          </h4>
                          {variant && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {variant.name[lang]}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onRemove(item.product.id, item.variantId)
                          }
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-[#F5F5F7]">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.product.id, item.variantId, -1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-950 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.product.id, item.variantId, 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-950 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-display text-sm font-bold text-slate-950">
                          {formatPrice(
                            item.product.priceUsd * item.quantity,
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
                <div className="rounded-2xl bg-[#F5F5F7] border border-slate-200/80 p-3.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {copy.cart.upsellTitle}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={upsellProduct.image}
                      alt={upsellProduct.name[lang]}
                      className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {upsellProduct.name[lang]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPrice(upsellProduct.priceUsd, currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddUpsell(upsellProduct)}
                      className="rounded-full bg-slate-950 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-blue-600 transition cursor-pointer shrink-0"
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
          <div className="p-6 border-t border-slate-200 bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{copy.cart.subtotal}</span>
                <span>{formatPrice(subtotalUsd, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{copy.cart.shipping}</span>
                <span className={shippingUsd === 0 ? 'text-emerald-600 font-semibold' : ''}>
                  {shippingUsd === 0
                    ? copy.cart.free
                    : formatPrice(shippingUsd, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-950 pt-2 border-t border-slate-100">
                <span>{copy.cart.total}</span>
                <span>{formatPrice(totalUsd, currency)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white py-3.5 px-6 text-sm font-bold transition shadow-lg cursor-pointer"
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

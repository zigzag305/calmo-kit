import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { CartItem, Currency, Lang } from '../types';
import { formatPrice, FREE_SHIPPING_EUR, FLAT_SHIPPING_EUR } from '../utils/currency';
import { getCopy } from '../i18n/translations';
import {
  isCalmoBackendConfigured,
  submitCalmoCheckout,
} from '../lib/calmoApi';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  lang: Lang;
  currency: Currency;
  onClose: () => void;
  onOrderComplete: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  items,
  lang,
  currency,
  onClose,
  onOrderComplete,
}) => {
  const copy = getCopy(lang);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Portugal / España');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  if (!open) return null;

  const subtotalEur = items.reduce(
    (sum, i) => sum + i.product.priceEur * i.quantity,
    0
  );
  const shippingEur = subtotalEur >= FREE_SHIPPING_EUR ? 0 : FLAT_SHIPPING_EUR;
  const totalEur = subtotalEur + shippingEur;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await submitCalmoCheckout({
        items,
        currency,
        lang,
        customer: { name, email, address, city, country },
      });

      if (result.url) {
        // Redirect to hosted Stripe Checkout session
        window.location.href = result.url;
        return;
      }

      setConfirmedRef(result.orderRef);
      onOrderComplete();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to process checkout'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setConfirmedRef(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      onClick={handleDone}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white text-stone-950 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h2 className="font-display text-lg font-bold">
                {copy.checkout.title}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {copy.checkout.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDone}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedRef ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-950">
              {copy.checkout.orderConfirmed}
            </h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              {copy.checkout.orderConfirmedDesc}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F1EA] border border-stone-200 px-4 py-2 text-xs font-bold text-stone-900">
              <span>{copy.checkout.orderNumber}:</span>
              <span className="text-emerald-700">{confirmedRef}</span>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleDone}
                className="rounded-full bg-stone-950 text-white px-7 py-3 text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
              >
                {copy.checkout.backToStore}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="rounded-2xl bg-[#F4F1EA] p-4 space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variantId}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-stone-800">
                    {item.quantity}× {item.product.name[lang]}
                  </span>
                  <span className="font-semibold text-stone-950">
                    {formatPrice(item.product.priceEur * item.quantity, currency)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-bold">
                <span>{copy.cart.total}</span>
                <span>{formatPrice(totalEur, currency)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xs font-bold text-stone-500">
                {copy.checkout.contact}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.checkout.fullName}
                  className="w-full rounded-xl border border-stone-200 bg-[#F4F1EA] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.checkout.email}
                  className="w-full rounded-xl border border-stone-200 bg-[#F4F1EA] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
                />
              </div>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={copy.checkout.address}
                className="w-full rounded-xl border border-stone-200 bg-[#F4F1EA] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={copy.checkout.city}
                  className="w-full rounded-xl border border-stone-200 bg-[#F4F1EA] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
                />
                <input
                  required
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={copy.checkout.country}
                  className="w-full rounded-xl border border-stone-200 bg-[#F4F1EA] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                {errorMsg}
              </p>
            )}

            <p className="text-[11px] text-stone-500 leading-relaxed bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
              {isCalmoBackendConfigured()
                ? lang === 'es'
                  ? 'Conectado a la función segura de CalmoKit (aislada de otros proyectos).'
                  : 'Connected to isolated CalmoKit checkout backend.'
                : copy.checkout.paymentNote}
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 hover:bg-stone-800 disabled:opacity-60 text-white py-3.5 px-6 text-sm font-bold transition shadow-lg cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {copy.checkout.placeOrder} · {formatPrice(totalEur, currency)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

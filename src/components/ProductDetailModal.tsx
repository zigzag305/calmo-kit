import React, { useState, useEffect } from 'react';
import {
  X,
  Box,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Truck,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { Currency, Lang, Product } from '../types';
import { formatPrice } from '../utils/currency';
import { productSrcSet } from '../lib/images';
import { getCopy } from '../i18n/translations';
import { Product3DViewer } from './three/Product3DViewer';

interface ProductDetailModalProps {
  product: Product | null;
  lang: Lang;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product, variantId: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  lang,
  currency,
  onClose,
  onAddToCart,
}) => {
  const copy = getCopy(lang);
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id ?? 'default');
      setQuantity(1);
      setViewMode(product.model3D ? '3d' : 'photo');
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const handleAdd = () => {
    onAddToCart(product, activeVariant.id, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl bg-white text-stone-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar with Breadcrumb (Video 2 PDP style) */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-stone-200/80 bg-white shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
            <span>{copy.pdp.allProducts}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            <span className="uppercase text-[11px]">{product.brand}</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
            <span className="text-stone-900 font-medium truncate">
              {product.name[lang]}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-950 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split Body (Video 2 Spline PDP) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* LEFT: Interactive 3D Viewport / Studio Photo */}
          <div className="lg:col-span-6 p-5 sm:p-8 bg-[#F4F1EA] flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F4F1EA] border border-stone-200/80">
              {viewMode === '3d' && product.model3D ? (
                <Product3DViewer
                  modelType={product.model3D.type}
                  primaryColor={activeVariant?.hex ?? product.model3D.primaryColor}
                  secondaryColor={product.model3D.secondaryColor}
                  accentColor={product.model3D.accentColor}
                  theme="light"
                  badgeLabel={copy.pdp.interactive3d}
                  dragHint={copy.pdp.dragToRotate}
                  resetLabel={copy.pdp.resetView}
                  autoSpinLabel={copy.pdp.autoSpin}
                />
              ) : (
                <img
                  src={product.image}
                  srcSet={productSrcSet(product.image)}
                  sizes="(min-width: 1024px) 560px, 92vw"
                  alt={product.name[lang]}
                  decoding="async"
                  className="w-full h-full object-cover bg-white"
                />
              )}
            </div>

            {product.illustration && (
              <p className="text-center text-[12px] text-stone-500">{copy.pdp.illustrationNote}</p>
            )}

            {/* 3D / Studio Photo Switcher (only when a 3D model exists) */}
            {product.model3D && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-950'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                {copy.pdp.interactive3d}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-950'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {copy.pdp.studioPhoto}
              </button>
            </div>
            )}
          </div>

          {/* RIGHT: Product Details, Variants, Contents, Specs & Add to Cart */}
          <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              {/* Brand & Fulfillment Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                    product.fulfillment === 'curated-kit'
                      ? 'bg-stone-950 text-[#8FD1B4]'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {product.fulfillment === 'curated-kit'
                    ? copy.catalog.curatedBadge
                    : `${copy.catalog.partnerBadge} · ${product.brand}`}
                </span>
                <span className="text-[11px] text-stone-400">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title & Rating */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-950 mt-3">
                {product.name[lang]}
              </h2>

              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-2xl font-bold text-stone-950">
                    {formatPrice(product.priceEur, currency)}
                  </span>
                  {product.compareAtEur && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.compareAtEur, currency)}
                    </span>
                  )}
                </div>
                {product.reviewCount > 0 && (
                  <div className="inline-flex items-center gap-1 text-xs text-stone-600 border-l border-stone-200 pl-4">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-stone-900">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-stone-400">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-stone-600 leading-relaxed">
                {product.description[lang]}
              </p>

              {/* Variant Selector (Updates 3D Model Color Live!) */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-2.5">
                  <span>{copy.pdp.variant}</span>
                  <span className="text-stone-500">
                    {activeVariant?.name[lang]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {product.variants.map((variant) => {
                    const selected = variant.id === activeVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium border transition cursor-pointer ${
                          selected
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: variant.hex }}
                        />
                        {variant.name[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What's Inside (for Curated Kits) */}
              {product.contents && product.contents.length > 0 && (
                <div className="mt-6 rounded-2xl bg-[#F4F1EA] p-4 border border-stone-200/70">
                  <h4 className="font-display text-xs font-bold text-stone-900 mb-2.5">
                    {copy.pdp.whatsInside}
                  </h4>
                  <ul className="space-y-1.5">
                    {product.contents.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-stone-700"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs Grid */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {product.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-200/80 px-3.5 py-2.5 bg-white"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">
                      {spec.label[lang]}
                    </div>
                    <div className="text-xs font-semibold text-stone-900 mt-0.5">
                      {spec.value[lang]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Sticky CTA Block (Video 2 full-width pill CTA) */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center rounded-full border border-stone-200 bg-[#F4F1EA] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Full-width Add to Cart Pill */}
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B6E4F] hover:bg-[#08513A] disabled:bg-stone-300 disabled:text-stone-700 text-white py-3.5 px-6 text-sm font-semibold transition shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {product.inStock
                    ? `${copy.pdp.addToCart} · ${formatPrice(
                        product.priceEur * quantity,
                        currency
                      )}`
                    : copy.pdp.outOfStock}
                </button>
              </div>

              {/* Fulfillment Transparency & Shipping Note */}
              <div className="flex items-start gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {product.fulfillment === 'curated-kit'
                    ? copy.pdp.curatedNote
                    : copy.pdp.partnerNote}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{copy.pdp.shipsWorldwide}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

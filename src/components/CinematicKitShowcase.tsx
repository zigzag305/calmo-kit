import React, { useState } from 'react';
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Currency, Lang, Product } from '../types';
import { formatPrice } from '../utils/currency';
import { productSrcSet } from '../lib/images';
import { getCopy } from '../i18n/translations';

interface CinematicKitShowcaseProps {
  kits: Product[];
  lang: Lang;
  currency: Currency;
  onAddToCart: (product: Product, variantId?: string) => void;
  onInspectProduct: (product: Product) => void;
}

export const CinematicKitShowcase: React.FC<CinematicKitShowcaseProps> = ({
  kits,
  lang,
  currency,
  onAddToCart,
  onInspectProduct,
}) => {
  const copy = getCopy(lang);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeKit = kits[activeIndex];
  const showcase = activeKit.showcase!;
  const otherKits = kits
    .map((kit, idx) => ({ kit, idx }))
    .filter(({ idx }) => idx !== activeIndex);

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + kits.length) % kits.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % kits.length);

  return (
    <section
      id="showcase"
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-[#1C1F1D] content-auto"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Eyebrow */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-xs text-white/65">
              {copy.showcase.eyebrow} — {showcase.order} / 0{kits.length}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {copy.showcase.title}
            </h2>
          </div>
        </div>

        {/* 12-Column Layout: Editorial Story | Active Kit Photo | Kit Switchers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* LEFT COLUMN: Kit Story, Specs, Price & CTAs */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div key={activeKit.id} className="animate-fade-in">
              {/* Scenario pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {showcase.scenarios.map((sc, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] uppercase tracking-wider text-white/90"
                  >
                    {sc[lang]}
                  </span>
                ))}
              </div>

              <h3 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-bold leading-[0.98] tracking-tight text-white">
                {activeKit.name[lang]}
              </h3>

              {/* Highlight Metric */}
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/85 bg-black/30 border border-white/10 px-3.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8FD1B4] shrink-0" />
                <span>{showcase.highlightMetric[lang]}</span>
              </div>

              {/* Description */}
              <p className="mt-5 text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
                {activeKit.description[lang]}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl font-bold text-white">
                  {formatPrice(activeKit.priceEur, currency)}
                </span>
                {activeKit.compareAtEur && (
                  <span className="text-base text-white/45 line-through">
                    {formatPrice(activeKit.compareAtEur, currency)}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {activeKit.inStock ? (
                  <button
                    type="button"
                    onClick={() => onAddToCart(activeKit)}
                    className="inline-flex items-center gap-2 min-h-[44px] rounded-full bg-[#0B6E4F] text-white border border-transparent hover:bg-[#08513A] px-7 py-3.5 text-xs sm:text-sm font-bold transition shadow-xl cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {copy.showcase.addToCart}
                  </button>
                ) : (
                  <span className="inline-flex items-center min-h-[44px] rounded-full bg-white/10 border border-white/20 text-white/85 px-6 py-3 text-xs sm:text-sm font-semibold">
                    {copy.catalog.comingSoon}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onInspectProduct(activeKit)}
                  className="inline-flex items-center gap-2 min-h-[44px] rounded-full bg-white/12 hover:bg-white/22 border border-white/20 text-white px-6 py-3.5 text-xs sm:text-sm font-semibold backdrop-blur-md transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#8FD1B4]" />
                  {copy.showcase.inspect3d}
                </button>
              </div>

              {/* Prev / Next Controls + Dots */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="w-11 h-11 rounded-full border border-white/25 bg-black/25 hover:bg-white hover:text-black text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Previous Kit"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-11 h-11 rounded-full border border-white/25 bg-black/25 hover:bg-white hover:text-black text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Next Kit"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {kits.map((k, idx) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeIndex
                          ? 'w-8 bg-white'
                          : 'w-2.5 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={k.name[lang]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER STAGE: Crisp Active Kit Photo */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-[440px] aspect-square">
              <div
                key={`${activeKit.id}-photo`}
                className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/15 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.55)] animate-fade-in"
              >
                <img
                  src={activeKit.image}
                  srcSet={productSrcSet(activeKit.image)}
                  sizes="(min-width: 1024px) 440px, 92vw"
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  alt={activeKit.name[lang]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                {activeKit.badge && (
                  <span className="absolute top-4 left-4 rounded-full bg-black/65 backdrop-blur-md border border-white/15 px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#8FD1B4]">
                    {activeKit.badge[lang]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Kit Switchers */}
          <div className="lg:col-span-2 order-3 flex lg:flex-col items-center justify-center gap-3 sm:gap-4">
            <span className="hidden lg:block text-[10px] tracking-[0.06em] text-white/55 uppercase mb-1">
              {copy.showcase.nextKits}
            </span>
            {otherKits.map(({ kit, idx }) => (
              <button
                key={kit.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border border-white/15 transition-all duration-300 cursor-pointer hover:border-white/60 hover:scale-105 shadow-xl"
                title={kit.name[lang]}
              >
                <img
                  src={kit.image}
                  srcSet={productSrcSet(kit.image)}
                  sizes="128px"
                  width={128}
                  height={128}
                  loading="lazy"
                  decoding="async"
                  alt={kit.name[lang]}
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-2.5 text-left">
                  <span className="text-[9px] text-white/65">
                    {kit.showcase?.order}
                  </span>
                  <span className="text-[11px] font-semibold text-white leading-tight line-clamp-1">
                    {kit.name[lang]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

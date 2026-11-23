import React from 'react';
import { ArrowRight, ShieldCheck, Clock, Sun } from 'lucide-react';
import { Currency, Lang, Product } from '../types';
import { getCopy } from '../i18n/translations';
import { formatPrice } from '../utils/currency';
import { productSrcSet } from '../lib/images';

interface HeroSectionProps {
  lang: Lang;
  currency: Currency;
  product?: Product;
  onBuyNow: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  currency,
  product,
  onBuyNow,
}) => {
  const copy = getCopy(lang);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full flex flex-col justify-end overflow-hidden bg-[#161917]"
    >
      {/* Full-bleed atmospheric background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-mountain.webp"
          srcSet="/images/hero-mountain-800.webp 800w, /images/hero-mountain.webp 1376w"
          sizes="100vw"
          width={1376}
          height={768}
          decoding="async"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#161917]/95 via-[#161917]/75 to-[#161917]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161917] via-transparent to-black/40" />
      </div>

      {/* Main Content Stack */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-10 sm:pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            {/* System Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md px-3.5 py-1.5 mb-4 sm:mb-5">
              <span className="h-2 w-2 rounded-full bg-[#0B6E4F]" />
              <span className="text-[11px] tracking-[0.16em] sm:tracking-[0.2em] text-white/90 uppercase">
                {copy.hero.systemTag}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[76px] font-bold leading-[0.95] tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
              {copy.hero.headlineLine1}
              <br />
              <span className="text-white/95">{copy.hero.headlineLine2}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-stone-200/90 max-w-xl leading-relaxed">
              {copy.hero.subcopy}
            </p>

            {/* Price + Single Comprar CTA straight to checkout */}
            {product && (
              <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="flex items-baseline sm:flex-col gap-3 sm:gap-0">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-white">
                    {formatPrice(product.priceEur, currency)}
                  </span>
                  <span className="text-xs sm:text-sm text-stone-300 sm:mt-0.5">
                    {copy.pdp.shipsWorldwide}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onBuyNow(product)}
                  className="group w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0B6E4F] text-white px-8 py-4 text-base font-bold hover:bg-[#08513A] active:scale-[0.99] transition shadow-[0_12px_36px_rgba(0,0,0,0.4)] cursor-pointer"
                >
                  {copy.hero.primaryCta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Hero Product Card */}
          {product && (
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#F4F1EA] p-3.5 sm:p-5 shadow-2xl border border-white/10 max-w-md mx-auto lg:ml-auto">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white">
                  <img
                    src={product.image}
                    srcSet={productSrcSet(product.image)}
                    sizes="(min-width: 1024px) 420px, 90vw"
                    width={800}
                    height={800}
                    alt={product.name[lang]}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3.5 sm:mt-4 flex items-center justify-between gap-3 px-1">
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-stone-950 leading-tight">
                      {product.name[lang]}
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {copy.pdp.shipsWorldwide}
                    </p>
                  </div>
                  <span className="font-display text-xl font-bold text-[#0B6E4F] shrink-0">
                    {formatPrice(product.priceEur, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Trust Strip */}
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/85">
            <Clock className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust1}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/85">
            <Sun className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust2}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/85">
            <ShieldCheck className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust3}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

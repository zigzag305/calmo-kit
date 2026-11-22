import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Box,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Currency, Lang, Product } from '../types';
import { formatPrice } from '../utils/currency';
import { getCopy } from '../i18n/translations';
import { Product3DViewer } from './three/Product3DViewer';

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
  const [stageMode, setStageMode] = useState<'photo' | '3d'>('photo');

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
      className="relative min-h-[820px] py-20 lg:py-28 overflow-hidden bg-[#1C1F1D]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Eyebrow + Mode Switch */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs text-white/65">
              {copy.showcase.eyebrow} — {showcase.order} / 0{kits.length}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {copy.showcase.title}
            </h2>
          </div>

          {/* Toggle between Studio Photography & Live 3D View right on stage */}
          <div className="inline-flex items-center rounded-full bg-black/35 border border-white/15 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setStageMode('photo')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                stageMode === 'photo'
                  ? 'bg-white text-black'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {copy.showcase.viewPhoto}
            </button>
            <button
              type="button"
              onClick={() => setStageMode('3d')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                stageMode === '3d'
                  ? 'bg-[#0B6E4F] text-white'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              {copy.showcase.view3d}
            </button>
          </div>
        </div>

        {/* 12-Column Video 3 Layout: Left Editorial Story | Center Active Stage | Right Depth-of-Field Switchers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* LEFT COLUMN: Kit Story, Specs, Price & CTAs */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKit.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
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

                {/* Big Uppercase Title (NUPTSE JACKET vibe) */}
                <h3 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[0.98] tracking-tight text-white">
                  {activeKit.name[lang]}
                </h3>

                {/* Highlight Metric */}
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/85 bg-black/30 border border-white/10 px-3.5 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FD1B4]" />
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
                  <button
                    type="button"
                    onClick={() => onAddToCart(activeKit)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0B6E4F] text-white border border-transparent hover:bg-[#08513A] px-7 py-3.5 text-xs sm:text-sm font-bold transition shadow-xl cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {copy.showcase.addToCart}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInspectProduct(activeKit)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/12 hover:bg-white/22 border border-white/20 text-white px-6 py-3.5 text-xs sm:text-sm font-semibold backdrop-blur-md transition cursor-pointer"
                  >
                    <Box className="w-4 h-4 text-[#8FD1B4]" />
                    {copy.showcase.inspect3d}
                  </button>
                </div>

                {/* Prev / Next Controls + Dots */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full border border-white/25 bg-black/25 hover:bg-white hover:text-black text-white flex items-center justify-center transition cursor-pointer"
                      aria-label="Previous Kit"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full border border-white/25 bg-black/25 hover:bg-white hover:text-black text-white flex items-center justify-center transition cursor-pointer"
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
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === activeIndex
                            ? 'w-8 bg-white'
                            : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={k.name[lang]}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER STAGE: Crisp Active Kit Photo OR Live Draggable 3D Viewer */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-[440px] aspect-square">
              <AnimatePresence mode="wait">
                {stageMode === 'photo' ? (
                  <motion.div
                    key={`${activeKit.id}-photo`}
                    initial={{ opacity: 0, scale: 0.9, y: 18, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.92, y: -14, filter: 'blur(6px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/15 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.55)] animate-float-slow"
                  >
                    <img
                      src={activeKit.image}
                      alt={activeKit.name[lang]}
                      className="w-full h-full object-contain p-5"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                    {activeKit.badge && (
                      <span className="absolute top-4 left-4 rounded-full bg-black/65 backdrop-blur-md border border-white/15 px-3.5 py-1 text-[10px] font-bold tracking-wider uppercase text-[#8FD1B4]">
                        {activeKit.badge[lang]}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${activeKit.id}-3d`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full rounded-[2rem] overflow-hidden border border-white/20 bg-black/25 backdrop-blur-sm shadow-[0_32px_90px_rgba(0,0,0,0.5)]"
                  >
                    <Product3DViewer
                      modelType={activeKit.model3D.type}
                      primaryColor={activeKit.model3D.primaryColor}
                      secondaryColor={activeKit.model3D.secondaryColor}
                      accentColor={activeKit.model3D.accentColor}
                      theme="transparent"
                      badgeLabel={copy.pdp.interactive3d}
                      dragHint={copy.showcase.dragHint}
                      resetLabel={copy.pdp.resetView}
                      autoSpinLabel={copy.pdp.autoSpin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: Depth-of-Field Blurred Variant Switchers (Video 3 signature!) */}
          <div className="lg:col-span-2 order-3 flex lg:flex-col items-center justify-center gap-4">
            <span className="hidden lg:block text-[10px] tracking-[0.06em] text-white/55 uppercase mb-1">
              {copy.showcase.nextKits}
            </span>
            {otherKits.map(({ kit, idx }) => (
              <button
                key={kit.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border border-white/15 transition-all duration-500 cursor-pointer hover:border-white/60 hover:scale-105 shadow-xl"
                title={kit.name[lang]}
              >
                <img
                  src={kit.image}
                  alt={kit.name[lang]}
                  className="w-full h-full object-cover blur-[2.5px] opacity-65 scale-105 group-hover:blur-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
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

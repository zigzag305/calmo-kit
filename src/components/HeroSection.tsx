import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, ShieldCheck, Clock, Package } from 'lucide-react';
import { Lang } from '../types';
import { getCopy } from '../i18n/translations';

interface HeroSectionProps {
  lang: Lang;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang }) => {
  const copy = getCopy(lang);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full flex flex-col justify-end overflow-hidden bg-[#161917]"
    >
      {/* Full-bleed atmospheric alpine hero background (Video 3: The North Face style) */}
      <div className="absolute inset-0">
        <img
          src="./images/hero-mountain.jpg"
          alt="CalmoKit alpine emergency preparedness"
          className="h-full w-full object-cover object-center scale-[1.02]"
        />
        {/* Cinematic directional scrim so white display copy is ultra-crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#161917]/92 via-[#161917]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161917] via-transparent to-black/35" />
      </div>

      {/* Main Content Stack (bottom-third editorial alignment from Video 3) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-14 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          {/* Tactical System Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md px-3.5 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#0B6E4F] animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] text-white/90 uppercase">
              {copy.hero.systemTag}
            </span>
          </div>

          {/* High-Impact Display Headline */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-[84px] font-bold leading-[0.94] tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
            {copy.hero.headlineLine1}
            <br />
            <span className="text-white/95">
              {copy.hero.headlineLine2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-stone-200/85 max-w-xl leading-relaxed">
            {copy.hero.subcopy}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href="#showcase"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#0B6E4F] text-white px-7 py-3.5 text-xs sm:text-sm font-bold hover:bg-[#08513A] transition shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
            >
              {copy.hero.primaryCta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#showroom"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-6 py-3.5 text-xs sm:text-sm font-semibold transition"
            >
              <Box className="w-4 h-4 text-[#8FD1B4]" />
              {copy.hero.secondaryCta}
            </a>
          </div>
        </motion.div>

        {/* Bottom Trust Telemetry Strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2 }}
          className="mt-14 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
            <Package className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust1}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
            <Clock className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust2}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
            <ShieldCheck className="w-4 h-4 text-[#8FD1B4] shrink-0" />
            <span>{copy.hero.trust3}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Utensils,
  Compass,
  Plus,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Currency, Lang, Product } from '../types';
import { formatPrice } from '../utils/currency';
import { getCopy } from '../i18n/translations';
import { LineArtScenarioScene, ScenarioId } from './LineArtScenarioScene';

interface ScenarioFinderProps {
  products: Product[];
  lang: Lang;
  currency: Currency;
  onInspectProduct: (product: Product) => void;
  onAddBundle: (items: Product[]) => void;
}

const SCENARIO_ICONS = [Flame, Zap, Utensils, Compass];

export const ScenarioFinder: React.FC<ScenarioFinderProps> = ({
  products,
  lang,
  currency,
  onInspectProduct,
  onAddBundle,
}) => {
  const copy = getCopy(lang);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeScenario = copy.scenarios.items[selectedIdx];
  const primaryProduct = products.find((p) => p.id === activeScenario.primaryId);
  const addonProduct = products.find((p) => p.id === activeScenario.addonId);

  if (!primaryProduct || !addonProduct) return null;

  const bundleTotal = primaryProduct.priceEur + addonProduct.priceEur;

  return (
    <section
      id="scenarios"
      className="bg-[#0B0F17] text-white py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-[#39FF14]">
            {copy.scenarios.eyebrow}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mt-2">
            {copy.scenarios.title}
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            {copy.scenarios.subtitle}
          </p>
        </div>

        {/* Situation Selector Pills */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {copy.scenarios.items.map((item, idx) => {
            const Icon = SCENARIO_ICONS[idx % SCENARIO_ICONS.length];
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center justify-center gap-2.5 rounded-2xl px-4 py-4 text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-950 border-white shadow-[0_12px_36px_rgba(255,255,255,0.12)]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-slate-950' : 'text-[#39FF14]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recommended Loadout Card */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#121926] to-[#0B1018] border border-white/10 p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Scenario Context + Live Animated Line-Art SVG Scene */}
            <div className="lg:col-span-4 space-y-4">
              <LineArtScenarioScene
                scenarioId={activeScenario.id as ScenarioId}
              />
              <span className="inline-flex items-center rounded-full bg-[#39FF14]/15 border border-[#39FF14]/35 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-[#39FF14] uppercase">
                {copy.scenarios.primaryPick}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold">
                {activeScenario.label}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeScenario.desc}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onAddBundle([primaryProduct, addonProduct])}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#39FF14] text-black hover:bg-[#66ff4d] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {copy.scenarios.addBundle} · {formatPrice(bundleTotal, currency)}
                </button>
              </div>
            </div>

            {/* Primary Kit + Plus + Partner Gear Add-on */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-4">
              {/* Primary Kit */}
              <div
                onClick={() => onInspectProduct(primaryProduct)}
                className="w-full sm:flex-1 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 p-4 flex items-center gap-4 cursor-pointer transition group"
              >
                <img
                  src={primaryProduct.image}
                  alt={primaryProduct.name[lang]}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#39FF14]">
                    {primaryProduct.brand}
                  </span>
                  <h4 className="font-display text-base font-bold text-white group-hover:text-[#39FF14] transition truncate">
                    {primaryProduct.name[lang]}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {primaryProduct.shortTagline[lang]}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {formatPrice(primaryProduct.priceEur, currency)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-[#39FF14]" />
              </div>

              {/* Add-on Gear */}
              <div
                onClick={() => onInspectProduct(addonProduct)}
                className="w-full sm:flex-1 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 p-4 flex items-center gap-4 cursor-pointer transition group"
              >
                <img
                  src={addonProduct.image}
                  alt={addonProduct.name[lang]}
                  className="w-24 h-24 rounded-xl object-cover bg-[#F5F5F7] shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400">
                    {copy.scenarios.includes}
                  </span>
                  <h4 className="font-display text-base font-bold text-white group-hover:text-sky-400 transition truncate">
                    {addonProduct.name[lang]}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {addonProduct.shortTagline[lang]}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {formatPrice(addonProduct.priceEur, currency)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

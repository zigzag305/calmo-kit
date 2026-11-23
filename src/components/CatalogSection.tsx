import React, { useMemo, useState } from 'react';
import {
  Search,
  Star,
  Plus,
  Check,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Currency,
  FulfillmentType,
  Lang,
  Product,
  ProductCategory,
} from '../types';
import { formatPrice } from '../utils/currency';
import { productSrcSet } from '../lib/images';
import { getCopy } from '../i18n/translations';

interface CatalogSectionProps {
  products: Product[];
  lang: Lang;
  currency: Currency;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  lang,
  currency,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onAddToCart,
}) => {
  const copy = getCopy(lang);
  const [category, setCategory] = useState<'all' | ProductCategory>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<
    'all' | FulfillmentType
  >('all');
  const [sortBy, setSortBy] = useState<'featured' | 'asc' | 'desc'>('featured');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (fulfillmentFilter !== 'all' && p.fulfillment !== fulfillmentFilter)
        return false;
      if (q) {
        const hay =
          `${p.name.en} ${p.name.es} ${p.shortTagline.en} ${p.shortTagline.es} ${p.brand} ${p.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'asc') {
      list = [...list].sort((a, b) => a.priceEur - b.priceEur);
    } else if (sortBy === 'desc') {
      list = [...list].sort((a, b) => b.priceEur - a.priceEur);
    } else {
      list = [...list].sort((a, b) => Number(b.inStock) - Number(a.inStock));
    }
    return list;
  }, [products, category, fulfillmentFilter, searchQuery, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1200);
  };

  const categoryTabs: { id: 'all' | ProductCategory; label: string }[] = [
    { id: 'all', label: copy.catalog.allCategories },
    { id: 'kits', label: copy.catalog.catKits },
    { id: 'food-water', label: copy.catalog.catFood },
    { id: 'survival', label: copy.catalog.catSurvival },
    { id: 'power-med', label: copy.catalog.catPower },
  ];

  return (
    <section
      id="catalog"
      className="bg-white text-stone-950 py-16 sm:py-20 lg:py-28 content-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row (Video 2 Apple/Stripe minimalist tone) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-semibold text-stone-500">
              {copy.catalog.eyebrow}
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-stone-950 mt-2">
              {copy.catalog.title}
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base">
              {copy.catalog.subtitle}
            </p>
          </div>

          {/* Search Input (Video 2 navbar search aesthetic) */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.nav.searchPlaceholder}
              className="w-full rounded-full bg-[#F4F1EA] border border-stone-200 pl-10 pr-4 py-2.5 text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 transition"
            />
          </div>
        </div>

        {/* Category Pills + Hybrid Sourcing Filter + Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-stone-200/80">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                  category === tab.id
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'bg-[#F4F1EA] text-stone-600 hover:bg-stone-200/80 hover:text-stone-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sourcing Filter (Curated Kits vs Partner Dropship Gear) & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full bg-[#F4F1EA] p-1 border border-stone-200/80 text-xs">
              {(
                [
                  { id: 'all', label: copy.catalog.filterAllTypes },
                  { id: 'curated-kit', label: copy.catalog.filterCurated },
                  { id: 'partner-gear', label: copy.catalog.filterPartner },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFulfillmentFilter(item.id)}
                  className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
                    fulfillmentFilter === item.id
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F1EA] border border-stone-200/80 px-3 py-1.5 text-xs text-stone-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'asc' | 'desc')
                }
                className="bg-transparent font-medium focus:outline-none cursor-pointer"
                aria-label="Sort products"
              >
                <option value="featured">{copy.catalog.sortFeatured}</option>
                <option value="asc">{copy.catalog.sortPriceAsc}</option>
                <option value="desc">{copy.catalog.sortPriceDesc}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid (Video 2 clean square #F4F1EA tiles) */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-500">{copy.catalog.noResults}</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => {
              const isAdded = justAddedId === product.id;
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group cursor-pointer flex flex-col"
                >
                  {/* Square Product Image Surface */}
                  <div
                    className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl ${
                      product.imageTheme === 'light'
                        ? 'bg-[#F4F1EA] border border-stone-200/70'
                        : 'bg-stone-900'
                    }`}
                  >
                    <img
                      src={product.image}
                      srcSet={productSrcSet(product.image)}
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
                      width={480}
                      height={480}
                      alt={product.name[lang]}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover bg-white transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top badge: Fulfillment type */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md ${
                          product.fulfillment === 'curated-kit'
                            ? 'bg-stone-950/85 text-[#8FD1B4]'
                            : 'bg-white/90 text-stone-800 border border-stone-200/80'
                        }`}
                      >
                        {product.fulfillment === 'curated-kit'
                          ? copy.catalog.curatedBadge
                          : copy.catalog.partnerBadge}
                      </span>
                    </div>

                    {/* Hover Quick Add Pill (or "coming soon" when not orderable yet) */}
                    {!product.inStock ? (
                      <span className="absolute bottom-3 right-3 rounded-full bg-[#F4F1EA] border border-stone-300 px-3.5 py-2 text-xs font-semibold text-stone-800">
                        {copy.catalog.comingSoon}
                      </span>
                    ) : (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold shadow-lg transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-950 text-white opacity-95 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 hover:bg-[#0B6E4F]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          {copy.catalog.quickAdd.replace('+ ', '')}
                        </>
                      )}
                    </button>
                    )}
                  </div>

                  {/* Minimalist Meta Below Image (Video 2 style) */}
                  <div className="mt-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-stone-400">
                        {product.brand}
                      </span>
                      {product.reviewCount > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs text-stone-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-stone-700">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-stone-400">
                            ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="mt-1 font-display text-base font-semibold text-stone-950 group-hover:text-emerald-700 transition">
                      {product.name[lang]}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2 flex-1">
                      {product.shortTagline[lang]}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-base font-bold text-stone-950">
                          {formatPrice(product.priceEur, currency)}
                        </span>
                        {product.compareAtEur && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatPrice(product.compareAtEur, currency)}
                          </span>
                        )}
                      </div>

                      {/* Variant color dots */}
                      <div className="flex items-center gap-1">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="w-3 h-3 rounded-full border border-stone-300"
                            style={{ backgroundColor: v.hex }}
                            title={v.name[lang]}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 2-Column Editorial Collection Banners (Video 2 signature layout) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-stone-950 text-white p-8 sm:p-10 min-h-[280px] flex flex-col justify-between group">
            <img
              src="/images/banner-kits.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-950/75 to-transparent" />
            <div className="relative z-10">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#8FD1B4]">
                {copy.catalog.banner1Eyebrow}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 max-w-md">
                {copy.catalog.banner1Title}
              </h3>
              <p className="mt-2 text-sm text-stone-300 max-w-md">
                {copy.catalog.banner1Desc}
              </p>
            </div>
            <div className="relative z-10 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCategory('all');
                  setFulfillmentFilter('curated-kit');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0B6E4F] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#08513A] transition cursor-pointer"
              >
                {copy.catalog.banner1Cta}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-[#F4F1EA] border border-stone-200 text-stone-950 p-8 sm:p-10 min-h-[280px] flex flex-col justify-between group">
            <img
              src="/images/banner-gear.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute right-0 bottom-0 w-56 h-56 object-cover opacity-85 mix-blend-multiply transition-transform duration-700 group-hover:scale-105 pointer-events-none"
            />
            <div className="relative z-10 max-w-md">
              <span className="text-[11px] tracking-[0.2em] uppercase text-emerald-700 font-semibold">
                {copy.catalog.banner2Eyebrow}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2">
                {copy.catalog.banner2Title}
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {copy.catalog.banner2Desc}
              </p>
            </div>
            <div className="relative z-10 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCategory('all');
                  setFulfillmentFilter('partner-gear');
                }}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 text-white px-5 py-2.5 text-xs font-bold hover:bg-[#0B6E4F] transition cursor-pointer"
              >
                {copy.catalog.banner2Cta}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

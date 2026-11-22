import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, Globe } from 'lucide-react';
import { Currency, Lang } from '../types';
import { getCopy } from '../i18n/translations';

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  cartCount: number;
  onOpenCart: () => void;
  onQuickSearch: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  currency,
  setCurrency,
  cartCount,
  onOpenCart,
  onQuickSearch,
}) => {
  const copy = getCopy(lang);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(searchTerm);
    setSearchOpen(false);
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { href: '#showcase', label: copy.nav.kits },
    { href: '#showroom', label: copy.nav.showroom },
    { href: '#catalog', label: copy.nav.catalog },
    { href: '#scenarios', label: copy.nav.scenarios },
    { href: '#faq', label: copy.nav.faq },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Announcement Bar (Video 2 & Video 3 fusion) */}
      <div className="bg-black text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-[11px] sm:text-xs font-mono tracking-wider">
          <span className="truncate text-white/90">{copy.announcement}</span>
          <a
            href="#showroom"
            className="hidden sm:inline-flex items-center rounded-full bg-[#39FF14] px-2.5 py-0.5 text-[10px] font-bold uppercase text-black hover:bg-[#66ff4d] transition shrink-0"
          >
            {copy.announcementCta}
          </a>
        </div>
      </div>

      {/* Main Sticky Glass Navigation */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[#080B10]/88 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-gradient-to-b from-black/65 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#top" className="flex items-center gap-2.5 group shrink-0">
            <div className="grid grid-cols-3 gap-[2.5px] p-1 rounded-md bg-white/5 border border-white/10 group-hover:border-[#39FF14]/50 transition">
              {[1, 1, 1, 1, 0, 0, 1, 1, 1].map((lit, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-[1px] transition-colors ${
                    lit ? 'bg-[#39FF14]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base sm:text-lg font-bold tracking-[0.18em] text-white">
                CALMO KIT
              </span>
              <span className="font-mono text-[9px] tracking-[0.22em] text-white/50">
                WWW.CALMOKIT.COM
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-[0.14em] text-white/80 hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* EN / ES Bilingual Toggle */}
            <div className="flex items-center rounded-full bg-white/10 border border-white/15 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-full transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-black font-bold'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded-full transition cursor-pointer ${
                  lang === 'es'
                    ? 'bg-white text-black font-bold'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                ES
              </button>
            </div>

            {/* Currency Toggle */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-mono text-white/85 hover:bg-white/20 transition cursor-pointer"
              title="Toggle Currency"
            >
              <Globe className="w-3 h-3 text-[#39FF14]" />
              {currency}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-white text-black px-3.5 py-2 text-xs font-semibold hover:bg-[#39FF14] transition cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-mono font-bold">{cartCount}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full text-white/85 hover:bg-white/10 transition cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Inline Search Bar */}
        {searchOpen && (
          <div className="border-t border-white/10 bg-[#0B1018]/95 backdrop-blur-xl px-4 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={copy.nav.searchPlaceholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold hover:bg-[#39FF14] transition cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#080B10]/98 backdrop-blur-xl px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium uppercase tracking-widest text-white/85 hover:text-[#39FF14]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Currency</span>
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
                className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-mono text-white"
              >
                {currency} ({currency === 'USD' ? '$' : '€'})
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

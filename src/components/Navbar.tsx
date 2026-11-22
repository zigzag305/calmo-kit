import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, Globe } from 'lucide-react';
import { Currency, Lang } from '../types';
import { getCopy } from '../i18n/translations';
import { BrandLogo } from './BrandLogo';

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
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-[11px] sm:text-xs tracking-wider">
          <span className="truncate text-white/90">{copy.announcement}</span>
          <a
            href="#showroom"
            className="hidden sm:inline-flex items-center rounded-full bg-[#0B6E4F] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white hover:bg-[#08513A] transition shrink-0"
          >
            {copy.announcementCta}
          </a>
        </div>
      </div>

      {/* Main Sticky Glass Navigation */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[#161917]/88 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-gradient-to-b from-black/65 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#top" className="flex items-center shrink-0" aria-label="CalmoKit">
            <BrandLogo size={30} tone="reverse" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-white/80 hover:text-white transition"
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

            {/* PT / ES / EN Trilingual Toggle */}
            <div className="flex items-center rounded-full bg-white/10 border border-white/15 p-0.5 text-[11px]">
              {(['pt', 'es', 'en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`px-2 py-1 rounded-full uppercase transition cursor-pointer ${
                    lang === code
                      ? 'bg-white text-black font-bold'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Currency Toggle */}
            <button
              type="button"
              onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] text-white/85 hover:bg-white/20 transition cursor-pointer"
              title="Toggle Currency"
            >
              <Globe className="w-3 h-3 text-[#8FD1B4]" />
              {currency}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-white text-[#1C1F1D] px-3.5 py-2 text-xs font-semibold hover:bg-[#F4F1EA] transition cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-bold">{cartCount}</span>
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
          <div className="border-t border-white/10 bg-[#1C1F1D]/95 backdrop-blur-xl px-4 py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={copy.nav.searchPlaceholder}
                className="w-full bg-transparent text-sm text-white placeholder:text-stone-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white text-[#1C1F1D] px-4 py-1.5 text-xs font-semibold hover:bg-[#F4F1EA] transition cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#161917]/98 backdrop-blur-xl px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white/85 hover:text-[#8FD1B4]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-stone-400">Currency</span>
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
                className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs text-white"
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

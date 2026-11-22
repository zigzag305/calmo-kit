import React, { useState } from 'react';
import { ChevronDown, Mail, ShieldCheck } from 'lucide-react';
import { Lang } from '../types';
import { getCopy } from '../i18n/translations';
import { BrandLogo } from './BrandLogo';
import { submitCalmoLead } from '../lib/calmoApi';

interface FaqAndFooterProps {
  lang: Lang;
}

export const FaqAndFooter: React.FC<FaqAndFooterProps> = ({ lang }) => {
  const copy = getCopy(lang);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitCalmoLead({
        email: email.trim(),
        lang,
        leadType: 'newsletter',
      });
      setSubscribed(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-white text-stone-950 py-20 lg:py-24 border-t border-stone-200"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-stone-500">
              {copy.faq.eyebrow}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              {copy.faq.title}
            </h2>
          </div>

          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {copy.faq.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-stone-950">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-stone-950' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-stone-600 leading-relaxed pr-8">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dark Flagship Footer */}
      <footer className="bg-[#161917] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <BrandLogo size={30} tone="reverse" />
              <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
                {copy.footer.tagline}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-stone-400">
                <ShieldCheck className="w-4 h-4 text-[#8FD1B4]" />
                <span>calmokit.eu</span>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs text-white/60">
                {copy.footer.shop}
              </h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li>
                  <a href="#showcase" className="hover:text-white transition">
                    {copy.nav.kits}
                  </a>
                </li>
                <li>
                  <a href="#showroom" className="hover:text-white transition">
                    {copy.nav.showroom}
                  </a>
                </li>
                <li>
                  <a href="#catalog" className="hover:text-white transition">
                    {copy.nav.catalog}
                  </a>
                </li>
                <li>
                  <a href="#scenarios" className="hover:text-white transition">
                    {copy.nav.scenarios}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-5 space-y-3">
              <h4 className="font-display text-base font-bold">
                {copy.footer.newsletterTitle}
              </h4>
              <p className="text-sm text-stone-400">
                {copy.footer.newsletterDesc}
              </p>
              {subscribed ? (
                <div className="rounded-xl bg-[#0B6E4F]/15 border border-[#8FD1B4]/40 px-4 py-3 text-xs font-medium text-[#8FD1B4]">
                  {copy.footer.newsletterThanks}
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center gap-2 pt-1"
                >
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.footer.newsletterPlaceholder}
                      className="w-full rounded-full bg-white/5 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-[#8FD1B4]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-[#0B6E4F] text-white hover:bg-[#08513A] px-5 py-2.5 text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    {copy.footer.newsletterBtn}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>
              © {new Date().getFullYear()} CalmoKit (calmokit.eu).{' '}
              {copy.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

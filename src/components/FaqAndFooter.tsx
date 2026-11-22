import React, { useState } from 'react';
import { ChevronDown, Mail, ShieldCheck } from 'lucide-react';
import { Lang } from '../types';
import { getCopy } from '../i18n/translations';
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
        className="bg-white text-slate-950 py-20 lg:py-24 border-t border-slate-200"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {copy.faq.eyebrow}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              {copy.faq.title}
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {copy.faq.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-slate-950">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-slate-950' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-8">
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
      <footer className="bg-[#070A10] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="grid grid-cols-3 gap-[2.5px] p-1 rounded-md bg-white/5 border border-white/10">
                  {[1, 1, 1, 1, 0, 0, 1, 1, 1].map((lit, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-[1px] ${
                        lit ? 'bg-[#39FF14]' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-display text-lg font-bold tracking-[0.2em]">
                  CALMO KIT
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {copy.footer.tagline}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                <span>www.calmokit.com</span>
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-widest text-white/60">
                {copy.footer.shop}
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
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
              <p className="text-sm text-slate-400">
                {copy.footer.newsletterDesc}
              </p>
              {subscribed ? (
                <div className="rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 px-4 py-3 text-xs font-medium text-[#39FF14]">
                  {copy.footer.newsletterThanks}
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center gap-2 pt-1"
                >
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.footer.newsletterPlaceholder}
                      className="w-full rounded-full bg-white/5 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-[#39FF14] text-black hover:bg-[#66ff4d] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
                  >
                    {copy.footer.newsletterBtn}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} CALMO KIT (www.calmokit.com).{' '}
              {copy.footer.rights}
            </p>
            <p className="font-mono text-[11px] text-slate-600">
              CALMO.SYS // PREPAREDNESS STOREFRONT v1.0
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { Lang } from '../types';
import { onOpenCookieSettings, readConsent, saveConsent } from '../lib/consent';

const TEXT = {
  es: {
    title: 'Cookies',
    body: 'Usamos cookies de Google para medir visitas y saber si nuestros anuncios funcionan, solo si las aceptas. El carrito funciona igual si las rechazas.',
    accept: 'Aceptar todas',
    reject: 'Rechazar',
    settings: 'Configurar',
    save: 'Guardar elección',
    analytics: 'Analítica (Google Analytics)',
    ads: 'Publicidad (Google Ads y Meta)',
    necessary: 'Necesarias (carrito y esta elección): siempre activas',
    policy: 'Política de cookies',
  },
  pt: {
    title: 'Cookies',
    body: 'Usamos cookies da Google para medir visitas e saber se os nossos anúncios funcionam, apenas se as aceitar. O carrinho funciona na mesma se as recusar.',
    accept: 'Aceitar todas',
    reject: 'Recusar',
    settings: 'Configurar',
    save: 'Guardar escolha',
    analytics: 'Análise (Google Analytics)',
    ads: 'Publicidade (Google Ads e Meta)',
    necessary: 'Necessárias (carrinho e esta escolha): sempre ativas',
    policy: 'Política de cookies',
  },
  en: {
    title: 'Cookies',
    body: 'We use Google cookies to count visits and see whether our ads work, only if you accept them. The cart works the same if you decline.',
    accept: 'Accept all',
    reject: 'Decline',
    settings: 'Settings',
    save: 'Save choice',
    analytics: 'Analytics (Google Analytics)',
    ads: 'Advertising (Google Ads & Meta)',
    necessary: 'Necessary (cart and this choice): always on',
    policy: 'Cookie policy',
  },
} as const;

/**
 * Accept and Decline are equally prominent, side by side (AEPD 2023 cookie
 * guide). Shown until the visitor chooses; reopened from the footer.
 */
export const CookieBanner: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = TEXT[lang];
  const [open, setOpen] = useState(() => readConsent() === null);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(
    () =>
      onOpenCookieSettings(() => {
        const saved = readConsent();
        setAnalytics(saved?.analytics ?? false);
        setAds(saved?.ads ?? false);
        setCustom(true);
        setOpen(true);
      }),
    []
  );

  if (!open) return null;

  const choose = (a: boolean, b: boolean) => {
    saveConsent(a, b);
    setOpen(false);
    setCustom(false);
  };

  const btn =
    'inline-flex items-center justify-center min-h-[44px] px-5 rounded-xl text-sm font-semibold transition cursor-pointer';

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-[70] rounded-2xl bg-white text-[#1C1F1D] border border-stone-200 shadow-xl p-5"
    >
      <h2 id="cookie-title" className="font-display text-xl font-semibold">
        {t.title}
      </h2>
      <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
        {t.body}{' '}
        <a href={`/legal/${lang}.html#cookies`} className="underline text-[#0B6E4F]">
          {t.policy}
        </a>
      </p>

      {custom && (
        <div className="mt-4 space-y-2.5 text-sm">
          <p className="text-stone-500">{t.necessary}</p>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="w-5 h-5 accent-[#0B6E4F]"
            />
            {t.analytics}
          </label>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={ads}
              onChange={(e) => setAds(e.target.checked)}
              className="w-5 h-5 accent-[#0B6E4F]"
            />
            {t.ads}
          </label>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => choose(false, false)} className={`${btn} bg-[#1C1F1D] text-white hover:bg-black`}>
          {t.reject}
        </button>
        <button type="button" onClick={() => choose(true, true)} className={`${btn} bg-[#1C1F1D] text-white hover:bg-black`}>
          {t.accept}
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => choose(analytics, ads)}
            className={`${btn} col-span-2 border border-stone-300 hover:bg-stone-50`}
          >
            {t.save}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCustom(true)}
            className={`${btn} col-span-2 border border-stone-300 hover:bg-stone-50`}
          >
            {t.settings}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Cookie consent state. Nothing non-essential runs until the visitor says yes
 * (AEPD / CNPD guidance: rejecting must be as easy as accepting, and no Google
 * script loads before consent).
 */
export interface ConsentState {
  analytics: boolean;
  ads: boolean;
  /** ISO timestamp of the choice, kept as proof of consent. */
  at: string;
}

const KEY = 'calmo_consent_v1';
const OPEN_EVENT = 'calmo:open-cookie-settings';
const CHANGE_EVENT = 'calmo:consent-changed';

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return typeof parsed.analytics === 'boolean' && typeof parsed.ads === 'boolean'
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, ads: boolean): ConsentState {
  const state: ConsentState = { analytics, ads, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode: the choice still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
  return state;
}

export function onConsentChange(cb: (s: ConsentState) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Footer link "Cookie settings" calls this to reopen the banner. */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(cb: () => void): () => void {
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}

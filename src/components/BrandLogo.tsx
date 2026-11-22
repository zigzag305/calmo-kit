import React from 'react';

/**
 * CalmoKit logo (direction A, "handle C"): a case with its carry handle and a
 * C for Calmo. Master files live in public/brand/ (built by scripts/brand).
 * Inline here so the navbar paints without an extra request.
 */
type Tone = 'default' | 'reverse';

const COLORS: Record<Tone, { body: string; inner: string; text: string }> = {
  // On light backgrounds: green case, white C, charcoal word.
  default: { body: '#0B6E4F', inner: '#FFFFFF', text: '#1C1F1D' },
  // On charcoal or photos: paper case, green C, paper word.
  reverse: { body: '#F4F1EA', inner: '#0B6E4F', text: '#F4F1EA' },
};

export const BrandSymbol: React.FC<{ size?: number; tone?: Tone; className?: string }> = ({
  size = 32,
  tone = 'default',
  className,
}) => {
  const c = COLORS[tone];
  // Below 40px the strokes get heavier so the C still reads.
  const small = size < 40;
  return (
    <svg
      width={size}
      height={size}
      viewBox="6 6 88 88"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M37 29V19a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v10"
        fill="none"
        stroke={c.body}
        strokeWidth={small ? 9 : 7}
      />
      <rect x="10" y="27" width="80" height="62" rx="14" fill={c.body} />
      <path
        d="M62.6 46.6A17 17 0 1 0 62.6 69.4"
        fill="none"
        stroke={c.inner}
        strokeWidth={small ? 11 : 9}
      />
    </svg>
  );
};

export const BrandLogo: React.FC<{ size?: number; tone?: Tone; className?: string }> = ({
  size = 32,
  tone = 'default',
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <BrandSymbol size={size} tone={tone} />
    <span
      className="font-display font-semibold leading-none"
      style={{ color: COLORS[tone].text, fontSize: size * 0.78 }}
    >
      CalmoKit
    </span>
  </span>
);

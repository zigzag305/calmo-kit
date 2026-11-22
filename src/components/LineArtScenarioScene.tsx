import React, { useEffect, useRef, useState } from 'react';

export type ScenarioId = 'evacuation' | 'blackout' | 'food-reserve' | 'wilderness';

interface LineArtScenarioSceneProps {
  scenarioId: ScenarioId;
}

/**
 * Hand-crafted animated ink-line SVG scenes inspired by `line-art-animation`:
 * live SVG strokes with gait cycle, wind sway, rain streaks, rising steam,
 * glowing shelter lantern, and subtle pointer parallax.
 */
export const LineArtScenarioScene: React.FC<LineArtScenarioSceneProps> = ({
  scenarioId,
}) => {
  const [tick, setTick] = useState(0);
  const [pointerX, setPointerX] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      setTick((ts - start) / 1000);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    setPointerX(nx);
  };

  // Gait phase for walking hiker (evacuation)
  const walkCycle = tick * 4.2;
  const legA = Math.sin(walkCycle) * 10;
  const legB = Math.sin(walkCycle + Math.PI) * 10;
  const armSwing = Math.sin(walkCycle + Math.PI) * 6;
  const bodyBob = Math.abs(Math.sin(walkCycle)) * -2.2;
  const cloudDrift = ((tick * 12) % 340) - 40;
  const windSway = Math.sin(tick * 2.1) * 4.5 + pointerX * 3;
  const lightningOpacity =
    Math.sin(tick * 1.7) > 0.96 ? 0.92 : Math.sin(tick * 3.1) > 0.985 ? 0.65 : 0;

  return (
    <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-white/10 bg-[#0A0F18]">
      <svg
        viewBox="0 0 360 150"
        className="w-full h-full select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setPointerX(0)}
        role="img"
        aria-label={`Animated line-art illustration for ${scenarioId}`}
      >
        <defs>
          <radialGradient id="calmoLanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#39FF14" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="amberWarmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle paper/blueprint ink grid */}
        <g stroke="rgba(148,163,184,0.08)" strokeWidth="0.75">
          {[30, 60, 90, 120].map((y) => (
            <line key={y} x1="0" y1={y} x2="360" y2={y} />
          ))}
        </g>

        {scenarioId === 'evacuation' && (
          <g
            fill="none"
            stroke="#E2E8F0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Distant ink mountain ridge with parallax */}
            <path
              d={`M ${-20 + pointerX * -6} 118 L ${58 + pointerX * -6} 56 L ${122 + pointerX * -6} 92 L ${202 + pointerX * -6} 40 L ${286 + pointerX * -6} 88 L ${380 + pointerX * -6} 52`}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1.4"
            />
            {/* Drifting ink cloud */}
            <path
              d={`M ${cloudDrift} 34 Q ${cloudDrift + 14} 24 ${cloudDrift + 28} 32 Q ${cloudDrift + 40} 26 ${cloudDrift + 52} 35`}
              stroke="rgba(148,163,184,0.5)"
              strokeWidth="1.2"
            />
            {/* Ground trail */}
            <path
              d="M 0 124 Q 110 116 210 122 T 360 118"
              stroke="rgba(226,232,240,0.65)"
              strokeWidth="1.6"
            />
            {/* Walking explorer figure with Calmo 72H Pack */}
            <g transform={`translate(${172 + pointerX * 8}, ${84 + bodyBob})`}>
              {/* Backpack (accented in neon-lime ink) */}
              <rect
                x="-15"
                y="-10"
                width="12"
                height="20"
                rx="3"
                stroke="#39FF14"
                strokeWidth="1.8"
                fill="rgba(57,255,20,0.08)"
              />
              {/* Head */}
              <circle cx="2" cy="-16" r="5" strokeWidth="1.8" />
              {/* Torso */}
              <line x1="2" y1="-11" x2="0" y2="10" strokeWidth="1.9" />
              {/* Swinging Arm + trekking pole */}
              <path
                d={`M 1 -6 L ${8 + armSwing * 0.6} 4 L ${12 + armSwing} 12`}
                strokeWidth="1.6"
              />
              <line
                x1={12 + armSwing}
                y1="12"
                x2={16 + armSwing * 0.8}
                y2="37"
                stroke="rgba(148,163,184,0.75)"
                strokeWidth="1.2"
              />
              {/* Gait legs */}
              <path
                d={`M 0 10 L ${legA * 0.7} 23 L ${legA} 36`}
                strokeWidth="1.9"
              />
              <path
                d={`M 0 10 L ${legB * 0.7} 23 L ${legB} 36`}
                strokeWidth="1.9"
              />
            </g>
            {/* Wind motion lines */}
            {[0, 1, 2].map((i) => {
              const x = 360 - ((tick * 75 + i * 115) % 400);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={46 + i * 24}
                  x2={x + 26}
                  y2={46 + i * 24}
                  stroke="rgba(57,255,20,0.35)"
                  strokeWidth="1.1"
                />
              );
            })}
          </g>
        )}

        {scenarioId === 'blackout' && (
          <g
            fill="none"
            stroke="#E2E8F0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Storm cloud */}
            <path
              d="M 48 36 Q 68 18 94 28 Q 118 14 142 30 Q 160 28 164 40 L 46 40 Z"
              stroke="rgba(148,163,184,0.55)"
              strokeWidth="1.4"
            />
            {/* Intermittent lightning bolt */}
            <path
              d="M 108 42 L 98 62 L 109 62 L 96 86"
              stroke="#38BDF8"
              strokeWidth="2"
              opacity={lightningOpacity}
            />
            {/* Falling ink rain streaks */}
            {Array.from({ length: 14 }).map((_, i) => {
              const rx = (i * 28 + 12) % 350;
              const ry = ((tick * 130 + i * 37) % 135) - 10;
              return (
                <line
                  key={i}
                  x1={rx}
                  y1={ry}
                  x2={rx - 4}
                  y2={ry + 11}
                  stroke="rgba(148,163,184,0.32)"
                  strokeWidth="1"
                />
              );
            })}
            {/* House silhouette with powered glowing lantern window */}
            <g transform={`translate(${185 + pointerX * 5}, 56)`}>
              <circle cx="48" cy="40" r="34" fill="url(#calmoLanternGlow)" stroke="none" />
              <path d="M 8 34 L 48 6 L 88 34" strokeWidth="2" />
              <rect x="16" y="34" width="64" height="44" strokeWidth="1.8" />
              {/* Powered lit window */}
              <rect
                x="37"
                y="45"
                width="22"
                height="18"
                stroke="#39FF14"
                strokeWidth="1.8"
                fill="rgba(57,255,20,0.22)"
              />
              <line x1="48" y1="45" x2="48" y2="63" stroke="#39FF14" strokeWidth="1.2" />
              <line x1="37" y1="54" x2="59" y2="54" stroke="#39FF14" strokeWidth="1.2" />
            </g>
            {/* Ground line */}
            <line x1="0" y1="134" x2="360" y2="134" stroke="rgba(226,232,240,0.5)" strokeWidth="1.5" />
          </g>
        )}

        {scenarioId === 'food-reserve' && (
          <g
            fill="none"
            stroke="#E2E8F0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Ground/table line */}
            <line x1="20" y1="126" x2="340" y2="126" stroke="rgba(226,232,240,0.55)" strokeWidth="1.6" />
            {/* Canteen + Ration Case */}
            <g transform={`translate(${92 + pointerX * 4}, 66)`}>
              <rect x="0" y="18" width="52" height="42" rx="5" strokeWidth="1.8" />
              <line x1="0" y1="30" x2="52" y2="30" strokeWidth="1.3" />
              <rect x="18" y="10" width="16" height="8" rx="2" stroke="#F59E0B" strokeWidth="1.6" />
            </g>
            {/* Camp mug with animated rising ink steam */}
            <g transform={`translate(${184 + pointerX * 6}, 76)`}>
              <circle cx="20" cy="24" r="32" fill="url(#amberWarmGlow)" stroke="none" />
              <rect x="4" y="14" width="32" height="36" rx="4" stroke="#F59E0B" strokeWidth="1.9" />
              <path d="M 36 22 Q 46 22 46 31 Q 46 40 36 40" stroke="#F59E0B" strokeWidth="1.8" />
              {[0, 1, 2].map((i) => {
                const phase = tick * 2.4 + i * 1.4;
                const sx = 12 + i * 8;
                const wave = Math.sin(phase) * 4;
                return (
                  <path
                    key={i}
                    d={`M ${sx} 8 Q ${sx + wave} -4 ${sx - wave * 0.6} -16 T ${sx + wave * 0.5} -34`}
                    stroke="rgba(245,158,11,0.75)"
                    strokeWidth="1.3"
                  />
                );
              })}
            </g>
            {/* Water droplet + ripple */}
            <g transform="translate(274, 88)">
              <path
                d="M 0 -22 C 6 -12 10 -6 10 0 A 10 10 0 1 1 -10 0 C -10 -6 -6 -12 0 -22 Z"
                stroke="#38BDF8"
                strokeWidth="1.7"
              />
              <ellipse
                cx="0"
                cy="32"
                rx={12 + (Math.sin(tick * 2.5) + 1) * 7}
                ry="3"
                stroke="rgba(56,189,248,0.5)"
                strokeWidth="1.2"
              />
            </g>
          </g>
        )}

        {scenarioId === 'wilderness' && (
          <g
            fill="none"
            stroke="#E2E8F0"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Twinkling stars */}
            {[
              [46, 26],
              [118, 20],
              [224, 24],
              [304, 30],
            ].map(([sx, sy], i) => (
              <circle
                key={i}
                cx={sx}
                cy={sy}
                r={1.3 + Math.sin(tick * 2.5 + i) * 0.6}
                fill="#E2E8F0"
                stroke="none"
                opacity={0.45 + Math.sin(tick * 2 + i) * 0.4}
              />
            ))}
            {/* Swaying ink pine trees */}
            {[62, 96, 294].map((tx, idx) => (
              <g key={tx} transform={`translate(${tx}, 126)`}>
                <line x1="0" y1="0" x2={windSway * 0.3} y2="-16" strokeWidth="1.6" />
                <path
                  d={`M ${-14 + windSway * 0.4} -16 L ${windSway} -54 L ${14 + windSway * 0.4} -16 Z`}
                  stroke={idx === 1 ? 'rgba(57,255,20,0.65)' : 'rgba(148,163,184,0.65)'}
                  strokeWidth="1.5"
                />
              </g>
            ))}
            {/* Glowing A-frame survival tent */}
            <g transform={`translate(${178 + pointerX * 5}, 126)`}>
              <circle cx="0" cy="-18" r="34" fill="url(#calmoLanternGlow)" stroke="none" />
              <path
                d="M -32 0 L 0 -46 L 32 0 Z"
                stroke="#39FF14"
                strokeWidth="1.9"
                fill="rgba(57,255,20,0.08)"
              />
              <path d="M -9 0 L 0 -22 L 9 0" stroke="#39FF14" strokeWidth="1.5" />
            </g>
            <line x1="0" y1="126" x2="360" y2="126" stroke="rgba(226,232,240,0.55)" strokeWidth="1.6" />
          </g>
        )}
      </svg>

      <div className="pointer-events-none absolute top-2.5 right-3 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400/80">
        LIVE INK SVG
      </div>
    </div>
  );
};

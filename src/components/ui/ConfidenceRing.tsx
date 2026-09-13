import React, { useEffect, useState } from 'react';

interface ConfidenceRingProps {
  value: number; // 0-100
  level?: string;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}

/**
 * Animated confidence ring — the single canonical confidence visualization.
 * Sweeps to its value on mount and smoothly transitions when the value changes.
 */
export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  value,
  level,
  size = 180,
  stroke = 10,
  label = 'DECISION CONFIDENCE',
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const [displayed, setDisplayed] = useState(0);

  // Sweep in on mount, then track prop changes smoothly
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDisplayed(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference * (1 - displayed / 100);

  const tone = clamped >= 75 ? '#34d399' : clamped >= 55 ? '#fbbf24' : clamped >= 35 ? '#fb923c' : '#f87171';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, perspective: 600 }}
      role="img"
      aria-label={`${label}: ${clamped} percent, ${level || ''}`}
    >
      {/* soft radial lighting behind the ring */}
      <div
        className="absolute inset-[14%] rounded-full blur-2xl cb-core-breathe pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tone}26 0%, transparent 70%)` }}
      />
      <svg
        width={size}
        height={size}
        className="relative -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.10)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1), stroke 400ms ease',
            filter: `drop-shadow(0 0 6px ${tone}59)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-extrabold tabular-nums text-white"
          style={{ fontSize: size * 0.24, lineHeight: 1, textShadow: '0 2px 18px rgba(0,0,0,0.6)' }}
        >
          {Math.round(displayed)}
          <span style={{ fontSize: size * 0.12, opacity: 0.55 }}>%</span>
        </span>
        {level && (
          <span
            className="mt-1.5 font-bold uppercase tracking-[0.2em]"
            style={{ fontSize: Math.max(8, size * 0.055), color: tone }}
          >
            {level}
          </span>
        )}
        {size >= 150 && (
          <span className="cb-meta mt-1.5 text-slate-500">{label}</span>
        )}
      </div>
    </div>
  );
};

interface StatDeltaProps {
  value: string;
  direction?: 'up' | 'down' | 'flat';
  className?: string;
}

/** Compact delta metric used in finding cards. */
export const StatDelta: React.FC<StatDeltaProps> = ({ value, direction = 'flat', className = '' }) => (
  <span
    className={`font-mono font-extrabold tabular-nums ${
      direction === 'down' ? 'text-rose-400' : direction === 'up' ? 'text-emerald-400' : 'text-slate-300'
    } ${className}`}
  >
    {value}
  </span>
);

import React, { useState } from 'react';
import { Database, FileCheck2, Globe2, ShieldAlert, FlaskConical, ChevronRight } from 'lucide-react';
import { UnifiedInvestigationState } from '../../types';
import { ConfidenceRing } from './ConfidenceRing';

export type CoreNodeAction =
  | 'data'
  | 'evidence'
  | 'market'
  | 'risk'
  | 'scenario';

interface DecisionCoreProps {
  state: UnifiedInvestigationState;
  onOpenNode: (action: CoreNodeAction) => void;
  onOpenConfidence: () => void;
}

interface SatelliteSpec {
  key: CoreNodeAction;
  label: string;
  icon: React.ReactNode;
  accent: string; // semantic accent color
  hoverTitle: string;
  hoverDetail: (s: UnifiedInvestigationState) => string;
  angle: number; // position on the orbit, degrees
  radius: number; // orbit radius multiplier 0..1
}

/**
 * DECISION CORE — the central orbital visualization.
 * Center: live decision confidence. Satellites: DATA / EVIDENCE / MARKET /
 * RISK / SCENARIO. Every satellite opens a real module — nothing decorative.
 * Pure CSS/SVG: no WebGL, no continuous render loops.
 */
export const DecisionCore: React.FC<DecisionCoreProps> = ({
  state,
  onOpenNode,
  onOpenConfidence,
}) => {
  const [hovered, setHovered] = useState<CoreNodeAction | null>(null);

  const verifiedCount = state.claims.filter((c) => c.verified).length;
  const marketActive = state.marketIntelligence.length > 0;
  const topRisk = state.scenarioResults.find((s) => s.isRecommended)?.modeledOutputs;
  const scenarioUpside = topRisk?.revenueDelta;

  const satellites: SatelliteSpec[] = [
    {
      key: 'data',
      label: 'DATA',
      icon: <Database className="w-4 h-4" />,
      accent: '#818cf8', // indigo — data semantics
      hoverTitle: `${state.dataQuality.overallPercent}% quality`,
      hoverDetail: () => `${state.activeDataSources.filter((s) => s.selected).length} active sources · ${state.activeDataSources.length} connected`,
      angle: -55,
      radius: 1,
    },
    {
      key: 'evidence',
      label: 'EVIDENCE',
      icon: <FileCheck2 className="w-4 h-4" />,
      accent: '#34d399', // emerald — verified semantics
      hoverTitle: `${verifiedCount}/${state.claims.length} verified`,
      hoverDetail: () => 'Audited claims grounding this recommendation',
      angle: 185,
      radius: 1,
    },
    {
      key: 'market',
      label: 'MARKET',
      icon: <Globe2 className="w-4 h-4" />,
      accent: '#22d3ee', // cyan — market semantics
      hoverTitle: marketActive ? 'External signals active' : 'Market search not selected',
      hoverDetail: () => `${state.marketIntelligence.length} external intelligence signals`,
      angle: 125,
      radius: 0.72,
    },
    {
      key: 'risk',
      label: 'RISK',
      icon: <ShieldAlert className="w-4 h-4" />,
      accent: '#f87171', // controlled red — risk semantics
      hoverTitle: 'Medium',
      hoverDetail: () => 'Highest vector: Customer retention deterioration',
      angle: 55,
      radius: 1,
    },
    {
      key: 'scenario',
      label: 'SCENARIO',
      icon: <FlaskConical className="w-4 h-4" />,
      accent: '#fbbf24', // amber — findings semantics
      hoverTitle: scenarioUpside !== undefined ? `${scenarioUpside > 0 ? '+' : ''}${scenarioUpside}% modelled upside` : 'No modelled upside',
      hoverDetail: () => `${state.scenarioResults.length} scenarios simulated`,
      angle: -125,
      radius: 0.72,
    },
  ];

  const activeSpec = satellites.find((s) => s.key === hovered);
  const cx = 50;
  const cy = 50;

  return (
    <section
      aria-label="Decision Core"
      className="relative w-full cb-glass rounded-3xl overflow-hidden cb-noise"
      style={{ perspective: '900px' }}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4 p-6 sm:p-10">
        {/* Orbital visualization */}
        <div
          className="relative shrink-0"
          style={{ width: 320, height: 320, maxWidth: '100%' }}
        >
          {/* Orbit rings */}
          <div className="cb-orbit-ring cb-orbit-slow" style={{ inset: '8%' }} />
          <div className="cb-orbit-ring cb-orbit-reverse" style={{ inset: '21%', borderStyle: 'solid', borderColor: 'rgba(148,163,184,0.07)' }} />

          {/* SVG connectors: center to each satellite */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="cb-core-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r="30" fill="url(#cb-core-halo)" />
            {satellites.map((s) => {
              const rad = (s.angle * Math.PI) / 180;
              const r = 34 * s.radius;
              const x = cx + r * Math.cos(rad);
              const y = cy + r * Math.sin(rad);
              const lit = hovered === s.key;
              return (
                <line
                  key={s.key}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={lit ? s.accent : 'rgba(148,163,184,0.18)'}
                  strokeWidth={lit ? 0.7 : 0.35}
                  className="cb-flow-line"
                  style={{
                    animationPlayState: hovered ? 'running' : 'running',
                    opacity: hovered && !lit ? 0.35 : 1,
                    transition: 'stroke 200ms ease, opacity 200ms ease',
                  }}
                />
              );
            })}
          </svg>

          {/* Center core: confidence */}
          <button
            type="button"
            onClick={onOpenConfidence}
            onMouseEnter={() => setHovered(null)}
            onFocus={() => setHovered(null)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cb-btn rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            title="Open confidence breakdown"
          >
            <ConfidenceRing
              value={state.recommendationConfidence.overallScore}
              level={state.recommendationConfidence.level}
              size={168}
              stroke={9}
            />
          </button>

          {/* Satellites */}
          {satellites.map((s) => {
            const rad = (s.angle * Math.PI) / 180;
            const orbR = 34 * s.radius; // in viewBox units
            const leftPct = 50 + orbR * Math.cos(rad);
            const topPct = 50 + orbR * Math.sin(rad);
            const lit = hovered === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onOpenNode(s.key)}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.key)}
                onBlur={() => setHovered(null)}
                className="absolute cb-node-float cb-btn rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${(s.angle + 180) / 90}s`,
                }}
                title={`Open ${s.label.toLowerCase()} module`}
              >
                <span
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border backdrop-blur-md"
                  style={{
                    background: lit
                      ? `linear-gradient(160deg, ${s.accent}2e, rgba(11,13,20,0.92))`
                      : 'linear-gradient(160deg, rgba(21,25,36,0.85), rgba(11,13,20,0.92))',
                    borderColor: lit ? `${s.accent}80` : 'rgba(148,163,184,0.14)',
                    boxShadow: lit
                      ? `0 14px 34px -14px ${s.accent}66, 0 0 0 1px ${s.accent}22, 0 1px 0 rgba(255,255,255,0.06) inset`
                      : '0 14px 34px -18px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.04) inset',
                    transition: 'background 200ms ease, border-color 200ms ease, box-shadow 240ms ease, transform 200ms cubic-bezier(0.22,1,0.36,1)',
                    transform: lit ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  <span style={{ color: s.accent }}>{s.icon}</span>
                  <span className="cb-meta text-slate-200">{s.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: hovered node detail or core summary */}
        <div className="flex-1 min-w-0 w-full">
          <span className="cb-kicker text-amber-400/90 block">Decision Core</span>
          <h2 className="cb-display text-xl sm:text-2xl text-white mt-1.5">
            Every recommendation is wired to live intelligence.
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Hover a node to inspect its state. Click to open the full module.
          </p>

          <div className="mt-5 min-h-[92px]">
            {activeSpec ? (
              <div
                className="cb-rise cb-glass rounded-xl p-4 flex items-center gap-3.5"
                key={activeSpec.key}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: `${activeSpec.accent}1a`,
                    borderColor: `${activeSpec.accent}4d`,
                    color: activeSpec.accent,
                  }}
                >
                  {activeSpec.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2.5">
                    <span className="cb-meta" style={{ color: activeSpec.accent }}>{activeSpec.label}</span>
                    <span className="text-sm font-bold text-white truncate">{activeSpec.hoverTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {activeSpec.hoverDetail(state)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenNode(activeSpec.key)}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 cb-btn shrink-0"
                >
                  Open module
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="cb-glass rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="cb-meta text-slate-500 block">Recommendation</span>
                  <span className="font-bold text-amber-300">{state.recommendationConfidence.level} confidence</span>
                </div>
                <div>
                  <span className="cb-meta text-slate-500 block">Evidence chain</span>
                  <span className="font-bold text-emerald-300">{verifiedCount}/{state.claims.length} claims verified</span>
                </div>
                <div>
                  <span className="cb-meta text-slate-500 block">Execution graph</span>
                  <span className="font-bold text-indigo-300">{state.investigationPlan.length} tool nodes planned</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

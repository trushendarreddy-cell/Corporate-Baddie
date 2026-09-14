import React, { useState } from 'react';
import {
  Network,
  Database,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  UnifiedInvestigationState,
  DependencyGraphNode,
  DependencyNodeImpact,
  EvidenceClaim,
  KeyFinding,
} from '../../types';
import { ConfidenceRing } from './ConfidenceRing';

interface EvidenceModuleProps {
  unifiedState: UnifiedInvestigationState;
  evidenceGraph: DependencyGraphNode[];
  onOpenEvidenceGraph: () => void;
  onViewEvidence: (finding: KeyFinding) => void;
  onToggleDataSource: (sourceId: string) => void;
}

interface NodeStyle {
  accent: string;
  label: string;
}

const NODE_STYLES: Record<string, NodeStyle> = {
  RECOMMENDATION: { accent: '#f59e0b', label: 'RECOMMENDATION' },
  DECISION_OPTION: { accent: '#22d3ee', label: 'DECISION OPTION' },
  SCENARIO_INPUT: { accent: '#2dd4bf', label: 'SCENARIO' },
  CLAIM: { accent: '#34d399', label: 'CLAIM' },
  EMPIRICAL_FINDING: { accent: '#818cf8', label: 'FINDING' },
  CALCULATION: { accent: '#a78bfa', label: 'CALCULATION' },
  DATA_SOURCE: { accent: '#6366f1', label: 'DATA SOURCE' },
  MARKET_INTEL: { accent: '#fb923c', label: 'MARKET INTEL' },
};

/**
 * EVIDENCE module — spatial evidence graph with depth, confidence explorer,
 * claim verification list, lineage. The EvidenceGraph modal remains the full
 * inspector; this surface adds the premium spatial visualization.
 */
export const EvidenceModule: React.FC<EvidenceModuleProps> = ({
  unifiedState,
  evidenceGraph,
  onOpenEvidenceGraph,
  onViewEvidence,
  onToggleDataSource,
}) => {
  const [showAllClaims, setShowAllClaims] = useState(false);

  const verifiedCount = unifiedState.claims.filter((c) => c.verified).length;

  // Spatial layout: recommendation at center-top, layered by depth from root
  const nodes = evidenceGraph;
  const byType = (t: string) => nodes.filter((n) => n.nodeType === t);
  const recommendation = byType('RECOMMENDATION');
  const midLayer = [...byType('DECISION_OPTION'), ...byType('SCENARIO_INPUT')];
  const claims = byType('CLAIM');
  const findings = byType('EMPIRICAL_FINDING');
  const calcLayer = byType('CALCULATION');
  const sources = [...byType('DATA_SOURCE'), ...byType('MARKET_INTEL')];

  const getImpactBadge = (impact: DependencyNodeImpact) => {
    switch (impact) {
      case 'DIRECTLY AFFECTED':
        return <span className="cb-meta text-rose-400">DIRECT</span>;
      case 'INDIRECTLY AFFECTED':
        return <span className="cb-meta text-amber-400">INDIRECT</span>;
      default:
        return <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />;
    }
  };

  const NodeCard: React.FC<{
    node: DependencyGraphNode;
    depth: number;
    compact?: boolean;
  }> = ({ node, depth, compact = false }) => {
    const style = NODE_STYLES[node.nodeType] || { accent: '#94a3b8', label: node.nodeType };
    return (
      <button
        type="button"
        onClick={onOpenEvidenceGraph}
        className="cb-glass cb-lift cb-press rounded-xl p-3 text-left cursor-pointer w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        style={{
          transformStyle: 'preserve-3d',
          borderLeft: `2px solid ${style.accent}66`,
          animationDelay: `${depth * 90}ms`,
        }}
        title={node.description}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="cb-meta" style={{ color: style.accent }}>{style.label}</span>
          {getImpactBadge(node.impactStatus)}
        </div>
        <p className={`text-[11px] font-semibold text-slate-200 mt-1 leading-snug ${compact ? 'truncate' : 'line-clamp-2'}`}>
          {node.title}
        </p>
        {!compact && (
          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{node.description}</p>
        )}
      </button>
    );
  };

  const displayedClaims: EvidenceClaim[] = showAllClaims
    ? unifiedState.claims
    : unifiedState.claims.slice(0, 5);

  return (
    <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b cb-hairline">
        <div>
          <p className="cb-kicker">Module</p>
          <h1 className="cb-display text-[26px] sm:text-[32px] text-white mt-2">Evidence</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[12.5px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="cb-metric text-[13px] text-emerald-300">{verifiedCount}</span>
            <span className="text-slate-500">/ {unifiedState.claims.length} verified</span>
          </span>
        </div>
      </div>

      {/* Confidence explorer — progressive disclosure */}
      <section className="cb-glass rounded-xl p-6" aria-label="Confidence explorer">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ConfidenceRing
            value={unifiedState.recommendationConfidence.overallScore}
            level={unifiedState.recommendationConfidence.level}
            size={200}
          />
          <div className="flex-1 w-full">
            <span className="cb-kicker text-slate-400">Confidence Composition</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              {(
                [
                  ['Data Quality', 'dataQuality', '#818cf8'],
                  ['Evidence Coverage', 'evidenceCoverage', '#22d3ee'],
                  ['Claim Verification', 'claimVerification', '#34d399'],
                  ['Evidence Consistency', 'evidenceConsistency', '#fbbf24'],
                  ['Source Completeness', 'sourceCompleteness', '#a78bfa'],
                  ['Analysis Reliability', 'analysisReliability', '#60a5fa'],
                ] as const
              ).map(([label, key, color]) => {
                const v = unifiedState.recommendationConfidence.breakdown[key];
                return (
                  <div key={key} className="cb-glass rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="cb-meta text-slate-400">{label}</span>
                      <span className="font-mono text-xs font-bold" style={{ color }}>{v}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-800 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${v}%`,
                          background: color,
                          transition: 'width 700ms cubic-bezier(0.22,1,0.36,1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Spatial layered graph — depth communicates lineage distance */}
      <section className="cb-glass rounded-xl p-6 cb-noise relative overflow-hidden" aria-label="Spatial evidence graph">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <span className="cb-kicker text-slate-400">Traceability Hierarchy</span>
            <p className="text-xs text-slate-500 mt-1">
              Recommendation → Options → Claims → Findings → Calculations → Sources
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenEvidenceGraph}
            className="cb-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold"
          >
            <Network className="w-3.5 h-3.5" />
            Open Full Graph Inspector
          </button>
        </div>

        <div className="space-y-5" style={{ perspective: '1000px' }}>
          {/* Layer 1: recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 md:col-start-2">
              {recommendation.map((n) => (
                <div key={n.id} className="cb-rise" style={{ animationDelay: '0ms' }}>
                  <NodeCard node={n} depth={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Layer 2: options & scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {midLayer.map((n, i) => (
              <div key={n.id} className="cb-rise" style={{ animationDelay: `${90 + i * 50}ms`, transform: 'translateY(4px)' }}>
                <NodeCard node={n} depth={1} />
              </div>
            ))}
          </div>

          {/* Layer 3: claims */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {claims.map((n, i) => (
              <div key={n.id} className="cb-rise" style={{ animationDelay: `${180 + i * 45}ms`, transform: 'translateY(8px)' }}>
                <NodeCard node={n} depth={2} compact />
              </div>
            ))}
          </div>

          {/* Layer 4: findings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {findings.map((n, i) => (
              <div key={n.id} className="cb-rise" style={{ animationDelay: `${270 + i * 45}ms`, transform: 'translateY(12px)' }}>
                <NodeCard node={n} depth={3} />
              </div>
            ))}
          </div>

          {/* Layer 5: calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calcLayer.map((n, i) => (
              <div key={n.id} className="cb-rise" style={{ animationDelay: `${360 + i * 45}ms`, transform: 'translateY(16px)' }}>
                <NodeCard node={n} depth={4} />
              </div>
            ))}
          </div>

          {/* Layer 6: sources — floating depth layer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sources.map((n, i) => (
              <div key={n.id} className="cb-rise" style={{ animationDelay: `${450 + i * 45}ms`, transform: 'translateY(20px)' }}>
                <NodeCard node={n} depth={5} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim verification ledger */}
      <section className="cb-glass rounded-xl p-6" aria-label="Claim verification">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="cb-kicker text-slate-400">Claim Verification Ledger</span>
            <p className="text-xs text-slate-500 mt-1">
              Every claim is verified, bounded, or explicitly flagged. Click any row for the inspector.
            </p>
          </div>
          {unifiedState.claims.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllClaims(!showAllClaims)}
              className="cb-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-bold"
            >
              {showAllClaims ? 'Show top 5' : `Show all ${unifiedState.claims.length}`}
              {showAllClaims ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {displayedClaims.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={onOpenEvidenceGraph}
              className="cb-rise cb-glass cb-lift cb-press w-full rounded-xl p-4 text-left cursor-pointer flex flex-wrap items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              style={{ animationDelay: `${i * 50}ms`, transformStyle: 'preserve-3d' }}
            >
              <span className="font-mono text-xs font-bold text-emerald-300 shrink-0">{c.id}</span>
              <span className="text-sm font-bold text-slate-100 min-w-0 flex-1 truncate">{c.title}</span>
              <span className="cb-meta text-slate-500 shrink-0">{c.type}</span>
              <span className="font-mono text-xs font-bold shrink-0" style={{ color: c.verified ? '#34d399' : '#fbbf24' }}>
                {c.verified ? 'VERIFIED' : 'UNVERIFIED'} · {c.confidence}%
              </span>
              {c.verified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Finding evidence triggers */}
      {unifiedState.empiricalFindings.length > 0 && (
        <section className="cb-glass rounded-xl p-6" aria-label="Finding lineage">
          <span className="cb-kicker text-slate-400">Findings → Source Lineage</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {unifiedState.empiricalFindings.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onViewEvidence(f)}
                className="cb-glass cb-lift cb-press rounded-xl p-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-center justify-between">
                  <span className="cb-meta text-slate-400">{f.label}</span>
                  <span className="cb-meta text-emerald-400/80">{f.detailedData.confidence}%</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">{f.detailedData.dataSource}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Data source toggles (robustness surface) */}
      <section className="cb-glass rounded-xl p-6" aria-label="Data lineage">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="cb-kicker text-slate-400">Connected Data Sources</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Toggling a source recomputes confidence, claims, and the recommendation live.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unifiedState.activeDataSources.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggleDataSource(s.id)}
              className={`cb-press rounded-xl p-4 text-left cursor-pointer border transition-all cb-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
                s.selected
                  ? 'bg-indigo-500/[0.07] border-indigo-500/30'
                  : 'bg-slate-900/40 border-slate-800 opacity-70'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
              title={s.description}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 truncate">{s.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${s.selected ? 'bg-emerald-400' : 'bg-slate-600'}`}
                />
              </div>
              <span className="cb-meta text-slate-500 mt-2 block">
                {s.type} · {s.selected ? `${s.recordsCount.toLocaleString()} rows` : 'deselected'}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Disabling the sales ledger (src-1) triggers DATA INSUFFICIENT mode — the platform refuses to
            issue a recommendation without verified transaction evidence.
          </span>
        </div>
      </section>
    </div>
  );
};

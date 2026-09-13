import React from 'react';
import { 
  TrendingDown, 
  ArrowDownRight, 
  ExternalLink, 
  FileSearch, 
  Layers, 
  DollarSign,
  Package,
  MapPin,
  Users,
  AlertTriangle,
  Info
} from 'lucide-react';
import { KeyFinding, CitationRef, EpistemicStatus } from '../types';
import { CitationBadge } from './CitationBadge';

interface KeyFindingsProps {
  findings: KeyFinding[];
  onViewEvidence: (finding: KeyFinding) => void;
  onSelectCitation?: (citation: CitationRef) => void;
}

export const KeyFindings: React.FC<KeyFindingsProps> = ({
  findings,
  onViewEvidence,
  onSelectCitation,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'kf-1':
        return <DollarSign className="w-4 h-4 text-rose-400" />;
      case 'kf-2':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'kf-3':
        return <MapPin className="w-4 h-4 text-orange-400" />;
      case 'kf-4':
        return <Users className="w-4 h-4 text-indigo-400" />;
      default:
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
    }
  };

  const getCitationBadgeId = (findingId: string) => {
    switch (findingId) {
      case 'kf-1': return 'D4';
      case 'kf-2': return 'D1';
      case 'kf-3': return 'D2';
      case 'kf-4': return 'D3';
      default: return 'D1';
    }
  };

  const getSourceBadgeId = (findingId: string) => {
    switch (findingId) {
      case 'kf-1': return 'S1';
      case 'kf-2': return 'S1';
      case 'kf-3': return 'S4';
      case 'kf-4': return 'S2';
      default: return 'S1';
    }
  };

  const getEpistemicBadge = (epistemic?: EpistemicStatus, id?: string) => {
    // Default mappings for key findings
    const label = epistemic || (id === 'kf-4' ? 'ASSOCIATION' : id === 'kf-1' ? 'DESCRIPTIVE AGGREGATE' : 'CAUSAL EVIDENCE');

    switch (label) {
      case 'CAUSAL EVIDENCE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            CAUSAL
          </span>
        );
      case 'ASSOCIATION':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30" title="Correlation only. Not proven as sole causal driver.">
            CORRELATION
          </span>
        );
      case 'DESCRIPTIVE AGGREGATE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            DESCRIPTIVE
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            OBSERVATIONAL
          </span>
        );
    }
  };

  return (
    <section 
      id="key-findings-section"
      aria-label="Key Findings"
      className="w-full space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 6 · Empirical Observations & Epistemic Boundaries
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>KEY FINDINGS</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-normal">
              Correlation vs. Causation Guardrails Active
            </span>
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Audited Ledgers · Click any badge for provenance
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {findings.map((finding) => (
          <div
            key={finding.id}
            className="group bg-[#0e121b] hover:bg-[#111622] border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-5 transition-all shadow-lg shadow-black/40 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top row */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {getIcon(finding.id)}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {finding.label}
                  </span>
                </div>
                
                {/* Epistemic Label & Badges */}
                <div className="flex items-center gap-1">
                  {getEpistemicBadge(finding.epistemicStatus, finding.id)}
                  <CitationBadge 
                    refId={getSourceBadgeId(finding.id)} 
                    onSelectCitation={onSelectCitation} 
                  />
                  <CitationBadge 
                    refId={getCitationBadgeId(finding.id)} 
                    onSelectCitation={onSelectCitation} 
                  />
                </div>
              </div>

              {/* Large Delta Metric */}
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 tracking-tight flex items-center gap-1">
                    {finding.change}
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    ({finding.value})
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-300 mt-1">
                  {finding.subtext}
                </p>
              </div>

              {/* Causality Note for Correlations */}
              {finding.id === 'kf-4' && (
                <div className="mt-2 p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-300 flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Guarded: Observational correlation. Recommendation engine does not claim customer churn alone caused revenue loss.</span>
                </div>
              )}
            </div>

            {/* Bottom "View Evidence" trigger */}
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                {finding.detailedData.confidence}% confidence
              </span>
              <button
                type="button"
                onClick={() => onViewEvidence(finding)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:underline transition-all"
              >
                <span>Audit Proof</span>
                <ArrowDownRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

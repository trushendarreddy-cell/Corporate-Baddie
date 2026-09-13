import React from 'react';
import { 
  CheckCircle2, 
  SlidersHorizontal, 
  GitFork, 
  Network, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface WhyThisRecommendationProps {
  onOpenEvidenceGraph: () => void;
}

export const WhyThisRecommendation: React.FC<WhyThisRecommendationProps> = ({
  onOpenEvidenceGraph,
}) => {
  const checklist = [
    { title: 'Internal sales evidence', desc: 'Consolidated ERP transaction ledgers audited; -$3.05M total contraction verified.' },
    { title: 'Product performance analysis', desc: 'SKU variance decomposition completed; Product A isolated as driving 68% of drop.' },
    { title: 'Regional analysis', desc: 'Territory divergence mapped; Region South identified as epicenter (-18.4%).' },
    { title: 'Customer behavior', desc: 'Cohort retention analysis validated; 90-day repurchase dropped from 49% to 42.8%.' },
    { title: 'Market intelligence', desc: 'External category pricing benchmark cross-referenced; 15-20% rival discounts confirmed.' },
    { title: 'Risk comparison', desc: 'Downside bounds evaluated; Option C preserves 89% of gross margin compared to company-wide cut.' },
  ];

  return (
    <section 
      id="why-recommendation-section"
      aria-label="Why This Recommendation"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 7 · Methodological Verification
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            WHY THIS RECOMMENDATION?
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Six-layer corroboration proving the decision logic is grounded in empirical evidence
          </p>
        </div>

        {/* View Evidence Graph Button */}
        <button
          onClick={onOpenEvidenceGraph}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all shadow-md group cursor-pointer"
        >
          <Network className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span>View Evidence Graph</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 6-Layer Verification Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklist.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
          >
            <div className="mt-0.5 p-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <span>{item.title}</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Graph Callout Bar */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-[#131926] to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              Causal Evidence Graph (DAG) Available
            </h4>
            <p className="text-[11px] text-slate-400">
              Inspect how CLAIM-031 is linked to CLAIM-017, CLAIM-024, CLAIM-028, and CLAIM-030 with audited confidence scores.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEvidenceGraph}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 border border-slate-700 transition-colors"
        >
          <span>Open Evidence Graph Inspector</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </section>
  );
};

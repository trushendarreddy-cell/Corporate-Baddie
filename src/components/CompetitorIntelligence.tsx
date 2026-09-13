import React from 'react';
import { 
  Globe2, 
  ExternalLink, 
  ShieldAlert, 
  TrendingDown, 
  AlertCircle, 
  Tag, 
  Layers, 
  Search,
  Radio
} from 'lucide-react';
import { CompetitorInfo, MarketSignal } from '../types';

interface CompetitorIntelligenceProps {
  signals?: MarketSignal[];
  competitors: CompetitorInfo[];
  pressureLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const CompetitorIntelligence: React.FC<CompetitorIntelligenceProps> = ({
  signals = [],
  competitors,
  pressureLevel = 'HIGH',
}) => {
  return (
    <div id="competitive-intelligence-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Competitive Intelligence & Market Landscape
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                Grounding Interface
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-referencing internal sales variance with external competitor campaigns and pricing dynamics
            </p>
          </div>
        </div>

        {/* Competitive Pressure Gauge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Competitive Pressure:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold ${
            pressureLevel === 'HIGH'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50 animate-pulse'
              : pressureLevel === 'MEDIUM'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
          }`}>
            {pressureLevel}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Prominent Mandatory Disclosure */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
          <Radio className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-indigo-300 uppercase tracking-wider mr-1.5">
              DEMO EXTERNAL RESEARCH:
            </span>
            Simulated market observations designed for prototype evaluation. CorporateBaddie’s integration architecture is built to swap these research vectors with real-time Perplexity, Gemini Search Grounding, or Google Shopping scrapers in production.
          </div>
        </div>

        {/* Competitor Landscape Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            COMPETITOR LANDSCAPE
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {competitors.map((comp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <h5 className="text-sm font-bold text-white">{comp.name}</h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Active Signal
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pricing:</span>
                    <p className="text-slate-200 font-medium">{comp.pricing}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Promotion:</span>
                    <p className="text-slate-300">{comp.promotion}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Product Position:</span>
                    <p className="text-slate-300">{comp.productPosition}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Market Signal:</span>
                    <p className="text-amber-200/90 font-mono text-[11px]">{comp.marketSignal}</p>
                  </div>
                </div>

                {/* Correlated Internal Finding Link */}
                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-cyan-300 bg-cyan-950/20 p-2 rounded-lg border border-cyan-800/30">
                  <span className="font-bold block text-cyan-200 mb-0.5">Internal Data Correlation:</span>
                  {comp.correlatedInternalFinding}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

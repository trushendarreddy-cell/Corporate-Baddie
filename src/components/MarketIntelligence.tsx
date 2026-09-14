import React from 'react';
import { 
  Globe2, 
  Calendar, 
  BookOpen, 
  Tag, 
  ShieldAlert, 
  ExternalLink,
  Radar
} from 'lucide-react';
import { MarketSignal } from '../types';

interface MarketIntelligenceProps {
  signals: MarketSignal[];
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ signals }) => {
  return (
    <section 
      id="market-intelligence-section"
      aria-label="Market Intelligence"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What's happening outside
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-purple-400" />
            What's happening outside
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Competitive pricing vectors, category promotional benchmarks, and regional elasticity
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-300 font-semibold">
          <Radar className="w-3.5 h-3.5 text-purple-400" />
          <span>Demo Market Sources</span>
        </div>
      </div>

      {/* Grid of External Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {signals.map((item) => (
          <div
            key={item.id}
            className="bg-[#121622] hover:bg-[#141a29] border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all shadow-md group relative overflow-hidden"
          >
            {/* Top Tag & Date */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-950/70 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  External Fact
                </span>

                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {item.date}
                </span>
              </div>

              {/* Signal Title */}
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                {item.signal}
              </h3>

              {/* Explanation */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.explanation}
              </p>
            </div>

            {/* Source & Demo Disclaimer */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[170px]" title={item.source}>
                    Source: {item.source}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/40">
                  DEMO
                </span>
              </div>

              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                *Synthesized research signal for prototype validation.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

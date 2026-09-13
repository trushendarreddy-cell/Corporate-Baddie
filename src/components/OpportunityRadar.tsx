import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MapPin, 
  Package, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { OpportunityItem } from '../types';

interface OpportunityRadarProps {
  opportunities: OpportunityItem[];
}

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({
  opportunities,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filters = ['All', 'Revenue', 'Profit', 'Customers', 'Regions', 'Products', 'Market'];

  const filteredItems = selectedFilter === 'All'
    ? opportunities
    : opportunities.filter((op) => op.filterTags.includes(selectedFilter));

  const getCategoryBadge = (cat: OpportunityItem['category']) => {
    switch (cat) {
      case 'Product':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/70 border border-indigo-800/50 text-indigo-300">PRODUCT OPPORTUNITY</span>;
      case 'Regional':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 border border-emerald-800/50 text-emerald-300">REGIONAL OPPORTUNITY</span>;
      case 'Customer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">CUSTOMER OPPORTUNITY</span>;
      case 'Margin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 border border-amber-800/50 text-amber-300">MARGIN OPPORTUNITY</span>;
    }
  };

  return (
    <div id="opportunity-radar-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Opportunity Radar & Growth Vectors
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Growth Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              CorporateBaddie extracts upside opportunities hidden inside transaction logs, not merely diagnosing decline
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline" />
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === f
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#101524] border border-slate-800/90 hover:border-emerald-500/40 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {getCategoryBadge(item.category)}
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {item.confidence}% Confidence
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Potential Impact:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{item.potentialImpact}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Evidence Strength:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-300 border border-cyan-800/40">
                    {item.evidenceStrength}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-200 mt-2">
                  <span className="font-bold text-emerald-300 block mb-0.5">Recommended Next Step:</span>
                  {item.recommendedNextStep}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

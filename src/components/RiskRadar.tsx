import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { RiskRadarItem } from '../types';

interface RiskRadarProps {
  risks: RiskRadarItem[];
  decisionConfidence?: number;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ risks, decisionConfidence }) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskRadarItem | null>(risks[0]);

  const getLevelColor = (level: RiskRadarItem['level']) => {
    switch (level) {
      case 'HIGH':
        return {
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
          dot: 'bg-rose-400',
          bar: 'w-full bg-rose-500',
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
          bar: 'w-3/4 bg-amber-400',
        };
      case 'LOW-MEDIUM':
        return {
          badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60',
          dot: 'bg-yellow-400',
          bar: 'w-1/2 bg-yellow-400',
        };
      case 'LOW':
        return {
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-400',
          bar: 'w-1/4 bg-emerald-400',
        };
    }
  };

  return (
    <div id="risk-radar-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Risk Radar & Mitigation Playbook
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                6 Vulnerability Vectors
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multidimensional risk quantification across financial margin hurdles, market dynamics, and data completeness
            </p>
          </div>
          {decisionConfidence !== undefined && (
            <span className="text-xs font-mono font-bold text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-lg px-2 py-1">
              Decision Confidence: {decisionConfidence}%
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Compact Risk Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risks.map((item, idx) => {
            const colors = getLevelColor(item.level);
            const isSelected = selectedRisk?.category === item.category;

            return (
              <div
                key={idx}
                onClick={() => setSelectedRisk(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#121624] border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {item.category}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colors.badge}`}>
                    {item.level}
                  </span>
                </div>

                {/* Risk Level Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${colors.bar}`} />
                </div>

                {/* Evidence snippet */}
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Evidence:</span>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed font-medium">
                      {item.evidence}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Mitigation:</span>
                    <p className="text-emerald-200/90 line-clamp-2 leading-relaxed">
                      {item.mitigation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

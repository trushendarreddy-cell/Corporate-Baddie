import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Radar
} from 'lucide-react';
import { TrendItem, EmergingSignal } from '../types';

interface TrendRadarProps {
  trends: TrendItem[];
  signals: EmergingSignal[];
}

export const TrendRadar: React.FC<TrendRadarProps> = ({ trends, signals }) => {
  const getStatusBadge = (status: TrendItem['status']) => {
    switch (status) {
      case 'Increasing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 border border-emerald-800/50 text-emerald-300">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Increasing
          </span>
        );
      case 'Declining':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 border border-rose-800/50 text-rose-300">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            Declining
          </span>
        );
      case 'Stable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Minus className="w-3 h-3 text-slate-400" />
            Stable
          </span>
        );
      case 'Emerging':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 border border-amber-800/50 text-amber-300">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Emerging
          </span>
        );
      case 'Uncertain':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/70 border border-purple-800/50 text-purple-300">
            <HelpCircle className="w-3 h-3 text-purple-400" />
            Uncertain
          </span>
        );
    }
  };

  return (
    <div id="trend-radar-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Trend Radar & Early Warning Detection
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Continuous Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tracking macro trajectory vectors across revenue, margins, customer behaviors, and pricing pressures
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Monitored Trends Table / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {trends.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/90 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{t.metric}</span>
                {getStatusBadge(t.status)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {t.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Emerging Signals Section */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              EMERGING SIGNALS (EARLY WARNING VECTORS)
            </h4>
            <span className="text-[11px] text-slate-400 italic">
              Notice: Emerging signals are predictive indicators, not confirmed root causes.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-xl bg-[#101524] border border-slate-800 hover:border-amber-500/30 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {sig.signalType}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {sig.confidence} Confidence
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    "{sig.title}"
                  </h5>

                  <div className="text-xs text-slate-300 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Evidence:</span>
                    <p className="font-mono text-[11px] text-slate-200">{sig.evidence}</p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-cyan-300 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-800/30">
                  <span className="font-bold block text-cyan-200 mb-0.5">Recommended Investigation:</span>
                  {sig.recommendedInvestigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Scale,
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { DecisionRoomOption } from '../types';

interface DecisionRoomProps {
  options: DecisionRoomOption[];
  onSelectOption?: (optionId: string) => void;
  decisionConfidence?: number;
  decisionConfidenceLabel?: string;
}

const riskTone = (risk: DecisionRoomOption['risk']) => {
  switch (risk) {
    case 'Low':
      return { text: 'text-emerald-300', ring: 'border-emerald-500/30 bg-emerald-500/10' };
    case 'Medium':
      return { text: 'text-amber-300', ring: 'border-amber-500/30 bg-amber-500/10' };
    case 'High':
      return { text: 'text-rose-300', ring: 'border-rose-500/30 bg-rose-500/10' };
  }
};

/**
 * DECISION ROOM — four elegant option cards by default; clicking expands a
 * detailed analysis panel. The full comparison matrix remains one click away.
 */
export const DecisionRoom: React.FC<DecisionRoomProps> = ({
  options,
  onSelectOption,
  decisionConfidence,
  decisionConfidenceLabel,
}) => {
  const [selectedId, setSelectedId] = useState<string>(options.find((o) => o.isRecommended)?.id || options[0]?.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const selectedOption = options.find((o) => o.id === selectedId) || options[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setExpandedId(expandedId === id ? null : id);
    if (onSelectOption) onSelectOption(id);
  };

  const getStrengthBadge = (strength: DecisionRoomOption['evidenceStrength']) => {
    switch (strength) {
      case 'Strong':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">Strong</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/40 text-amber-300">Moderate</span>;
      case 'Weak':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Weak</span>;
    }
  };

  return (
    <div id="decision-room-section" className="cb-glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cb-kicker text-white">Decision Room</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Four strategic options, appraised on evidence, unit economics, and execution friction
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowMatrix(!showMatrix)}
          className="cb-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-200"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          {showMatrix ? 'Show Option Cards' : 'Compare Options (Matrix)'}
        </button>
      </div>

      <div className="p-5 sm:p-7">
        {/* Option cards — progressive disclosure default */}
        {!showMatrix && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {options.map((opt) => {
              const isSelected = selectedId === opt.id;
              const isExpanded = expandedId === opt.id;
              const tone = riskTone(opt.risk);

              return (
                <div
                  key={opt.id}
                  className={`cb-rise cb-lift cb-press rounded-2xl p-5 border cursor-pointer relative transition-all ${
                    isSelected
                      ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-950/60'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: opt.isRecommended
                      ? '0 0 0 1px rgba(245,158,11,0.25), 0 24px 50px -24px rgba(0,0,0,0.85)'
                      : undefined,
                    animationDelay: `${options.indexOf(opt) * 60}ms`,
                  }}
                  onClick={() => handleSelect(opt.id)}
                >
                  {opt.isRecommended && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-400 text-slate-950 tracking-widest">
                      RECOMMENDED
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white leading-snug">{opt.name}</h4>
                  </div>

                  {/* Big confidence number */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-3xl font-mono font-extrabold tabular-nums ${opt.confidence >= 70 ? 'text-emerald-400' : opt.confidence >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {opt.confidence}%
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="cb-meta text-slate-500">Expected</span>
                      <span className="font-mono font-bold text-emerald-300">{opt.expectedImpact.split('(')[0].trim()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="cb-meta text-slate-500">Risk</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tone?.ring} ${tone?.text}`}>{opt.risk}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="cb-meta text-slate-500">Time</span>
                      <span className="font-mono text-slate-300">{opt.timeToImpact}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/70">
                      <span className="cb-meta text-slate-500">Evidence</span>
                      {getStrengthBadge(opt.evidenceStrength)}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400/90">
                      {isExpanded ? 'Hide analysis' : 'Detailed analysis'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* Expanded analysis panel (progressive disclosure) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <span className="cb-meta text-emerald-400 block mb-1.5 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Supporting evidence
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.supportingEvidence.slice(0, 3).map((e, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-emerald-400 block mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Upside
                        </span>
                        <p className="text-slate-300 leading-relaxed">{opt.whyThisOption.potentialUpside}</p>
                      </div>
                      <div>
                        <span className="cb-meta text-rose-400 block mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Key risks
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-rose-400 mt-0.5">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-cyan-400 block mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Dependencies
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.dependencies.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-amber-400 block mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> What must be true
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.whatMustBeTrue.map((w, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-800/70 text-slate-400">
                        <span className="cb-meta text-slate-500 block mb-0.5">Cost</span>
                        <span className="font-mono">{opt.cost}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison matrix — on demand */}
        {showMatrix && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 animate-in fade-in duration-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Strategic Option</th>
                  <th className="p-3.5">Expected Impact</th>
                  <th className="p-3.5">Evidence</th>
                  <th className="p-3.5">Cost</th>
                  <th className="p-3.5">Risk</th>
                  <th className="p-3.5">Feasibility</th>
                  <th className="p-3.5">Time to Impact</th>
                  <th className="p-3.5">Strategic Fit</th>
                  <th className="p-3.5 pr-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {options.map((opt) => {
                  const isSelected = selectedId === opt.id;
                  const tone = riskTone(opt.risk);
                  return (
                    <tr
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {opt.name}
                            {opt.isRecommended && (
                              <span className="px-1.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">REC</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">{opt.expectedImpact}</td>
                      <td className="p-3.5">{getStrengthBadge(opt.evidenceStrength)}</td>
                      <td className="p-3.5 font-mono text-slate-300">{opt.cost}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tone?.ring} ${tone?.text}`}>{opt.risk}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-medium">{opt.feasibility}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{opt.timeToImpact}</td>
                      <td className="p-3.5 font-medium text-cyan-300">{opt.strategicFit}</td>
                      <td className="p-3.5 pr-4 text-right">
                        <span className="font-mono font-bold text-amber-400">{opt.confidence}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected option deep-dive banner (contextual, always available) */}
        <div className="mt-6 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="cb-meta text-amber-400">Selected option</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedOption.name}</h4>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {decisionConfidenceLabel || 'Decision Confidence'}:
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 font-mono">
                {decisionConfidence ?? selectedOption.confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

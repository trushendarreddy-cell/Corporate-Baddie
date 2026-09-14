import React, { useState } from 'react';
import {
  Target,
  ChevronDown,
  ChevronUp,
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
    <div id="decision-room-section" className="rounded-xl border cb-hairline bg-slate-950/40 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b cb-hairline">
        <div>
          <h3 className="cb-kicker">Decision Room</h3>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Four strategic options, appraised on evidence and unit economics
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMatrix(!showMatrix)}
          className="cb-btn px-3 py-1.5 rounded-md text-[12.5px] font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
        >
          {showMatrix ? 'Show Option Cards' : 'Compare Options'}
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Option cards — progressive disclosure default */}
        {!showMatrix && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {options.map((opt) => {
              const isSelected = selectedId === opt.id;
              const isExpanded = expandedId === opt.id;
              const tone = riskTone(opt.risk);

              return (
                <div
                  key={opt.id}
                  className={`cb-rise cb-lift cb-press rounded-lg p-4 border cursor-pointer relative ${
                    opt.isRecommended
                      ? 'border-amber-500/35 bg-amber-950/[0.08]'
                      : isSelected
                      ? 'border-slate-600 bg-slate-900/50'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                  }`}
                  style={{
                    animationDelay: `${options.indexOf(opt) * 50}ms`,
                  }}
                  onClick={() => handleSelect(opt.id)}
                >
                  {opt.isRecommended && (
                    <span className="cb-meta !text-amber-400/90 block -mt-1 mb-2">
                      Recommended
                    </span>
                  )}

                  <h4 className="text-[13.5px] font-semibold text-white leading-snug">{opt.name}</h4>

                  {/* Big confidence number */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className={`cb-metric text-[26px] ${opt.confidence >= 70 ? 'text-emerald-300' : opt.confidence >= 50 ? 'text-amber-300' : 'text-rose-300'}`}>
                      {opt.confidence}%
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Expected</span>
                      <span className="font-mono font-medium text-emerald-300">{opt.expectedImpact.split('(')[0].trim()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Risk</span>
                      <span className={tone?.text}>{opt.risk}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="font-mono text-slate-300">{opt.timeToImpact}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500">Evidence</span>
                      {getStrengthBadge(opt.evidenceStrength)}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-amber-400/80">
                      {isExpanded ? 'Hide analysis' : 'Detailed analysis'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-amber-400/70" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>

                  {/* Expanded analysis panel (progressive disclosure) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 text-[11.5px] animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <span className="cb-meta text-emerald-400/90 block mb-1.5">Supporting evidence</span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.supportingEvidence.slice(0, 3).map((e, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-400/70 mt-0.5">·</span>
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-emerald-400/90 block mb-1">Upside</span>
                        <p className="text-slate-300 leading-relaxed">{opt.whyThisOption.potentialUpside}</p>
                      </div>
                      <div>
                        <span className="cb-meta text-rose-400/90 block mb-1.5">Key risks</span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.risks.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-rose-400/70 mt-0.5">·</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-cyan-400/90 block mb-1.5">Dependencies</span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.dependencies.map((d, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-cyan-400/70 mt-0.5">·</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="cb-meta text-amber-400/90 block mb-1.5">What must be true</span>
                        <ul className="space-y-1 text-slate-300">
                          {opt.whyThisOption.whatMustBeTrue.map((w, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-amber-400/70 mt-0.5">·</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 text-slate-400 flex justify-between">
                        <span className="text-slate-500">Cost</span>
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
          <div className="overflow-x-auto rounded-lg border cb-hairline bg-slate-950/50">
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

        {/* Selected option deep-dive banner */}
        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-950/[0.06] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <Target className="w-4 h-4 text-amber-400" />
            <div>
              <p className="cb-meta">Selected</p>
              <h4 className="text-[13.5px] font-semibold text-white mt-0.5">{selectedOption.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[12.5px] text-slate-500">{decisionConfidenceLabel || 'Decision Confidence'}</span>
            <span className="cb-metric text-[15px] text-amber-300">
              {decisionConfidence ?? selectedOption.confidence}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

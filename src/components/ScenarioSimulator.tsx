import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Check,
} from 'lucide-react';
import { MultiScenarioItem, MultiScenarioItemOutputs, ScenarioParams, ScenarioResult } from '../types';

interface ScenarioSimulatorProps {
  scenarios?: MultiScenarioItem[];
  initialParams?: ScenarioParams;
  onParamsChange?: (params: ScenarioParams, results: ScenarioResult) => void;
  onApplyScenarioToDecision?: (scenario: MultiScenarioItem) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  scenarios = [],
  initialParams,
  onParamsChange,
  onApplyScenarioToDecision,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-a');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Active sandbox sliders
  const [customParams, setCustomParams] = useState<ScenarioParams>(
    initialParams || {
      priceChangePercent: -5,
      marketingBudgetLakhs: 2.8,
      discountPercent: 8,
      inventoryLevel: 'Optimal',
      targetRegion: 'South',
      customerSegment: 'Churn-Risk',
    }
  );

  // Dynamic simulation calculations
  const calculateSandboxResults = (p: ScenarioParams): ScenarioResult => {
    const priceElasticity = p.targetRegion === 'South' ? -1.8 : -1.2;
    const volumeDeltaFromPrice = (p.priceChangePercent * priceElasticity);
    const volumeDeltaFromMarketing = (p.marketingBudgetLakhs * 1.6);
    const volumeDeltaFromDiscount = (p.discountPercent * 0.45);

    const netVolumeDelta = volumeDeltaFromPrice + volumeDeltaFromMarketing + volumeDeltaFromDiscount;
    const netRevenueDelta = (p.priceChangePercent) + netVolumeDelta * 0.75;
    
    const marginDrag = (p.discountPercent * 0.25) + (p.priceChangePercent < 0 ? Math.abs(p.priceChangePercent) * 0.35 : -p.priceChangePercent * 0.4);
    const netGrossMarginDelta = -marginDrag + (p.marketingBudgetLakhs > 7 ? -0.8 : 0);

    let risk: ScenarioResult['riskLevel'] = 'Low';
    if (Math.abs(p.priceChangePercent) > 7 || p.marketingBudgetLakhs > 8 || p.discountPercent > 18) {
      risk = 'High';
    } else if (Math.abs(p.priceChangePercent) > 3 || p.marketingBudgetLakhs > 4 || p.discountPercent > 8) {
      risk = 'Medium';
    }

    return {
      revenueDelta: Number(netRevenueDelta.toFixed(1)),
      grossMarginDelta: Number(netGrossMarginDelta.toFixed(1)),
      customerVolumeDelta: Number(netVolumeDelta.toFixed(1)),
      riskLevel: risk,
    };
  };

  const sandboxResults = calculateSandboxResults(customParams);

  useEffect(() => {
    if (onParamsChange) {
      onParamsChange(customParams, sandboxResults);
    }
  }, [customParams]);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleApplyScenario = (scenario: MultiScenarioItem) => {
    if (onApplyScenarioToDecision) {
      onApplyScenarioToDecision(scenario);
    }
    setAppliedNotice(`Applied "${scenario.name}" to live Decision Room.`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const getRiskBadge = (risk: MultiScenarioItemOutputs['executionRisk']) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'High':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

    return (
    <div id="what-if-scenario-section" className="cb-glass rounded-3xl overflow-hidden">
      {/* Top Header */}
      <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="cb-kicker text-white">What-If Strategy Lab</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                MODELLED ESTIMATE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Move the levers — revenue, margin, volume, and risk respond in real time
            </p>
          </div>
        </div>

        {appliedNotice && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{appliedNotice}</span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Scenario Selection Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`cb-press p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-950/25 border-amber-500/60 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {sc.isRecommended && (
                  <span className="absolute -top-2 -right-1 px-1.5 rounded text-[9px] font-extrabold bg-amber-400 text-slate-950 uppercase">
                    Recommended
                  </span>
                )}
                {sc.isBaseline && (
                  <span className="absolute -top-2 -right-1 px-1.5 rounded text-[9px] font-bold bg-slate-700 text-slate-200 uppercase">
                    Baseline
                  </span>
                )}

                <span className="cb-meta text-slate-400 block truncate">
                  {sc.id.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-white block mt-1 truncate">
                  {sc.name.split(':')[0]}
                </span>
                <span className={`text-[10px] font-mono font-bold block truncate mt-1.5 ${sc.modeledOutputs.revenueDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rev: {sc.modeledOutputs.revenueDelta >= 0 ? '+' : ''}{sc.modeledOutputs.revenueDelta}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Card & outputs */}
        {activeScenario && (
          <div className="cb-glass rounded-2xl p-5 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white">
                    {activeScenario.name}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    activeScenario.label === 'MODELLED ESTIMATE'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  }`}>
                    {activeScenario.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeScenario.isBaseline
                    ? 'Baseline reference case — no intervention deployed.'
                    : `Payoff horizon: ${activeScenario.timeToPayoffMonths} month${activeScenario.timeToPayoffMonths === 1 ? '' : 's'} · ${activeScenario.modeledOutputs.capitalRequiredLakhs !== undefined ? `₹${activeScenario.modeledOutputs.capitalRequiredLakhs}L capital` : 'capital-neutral'}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyScenario(activeScenario)}
                  className="cb-btn px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to Decision Room</span>
                </button>
              </div>
            </div>

            {/* Modeled Key Outputs Grid — animated values */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Revenue Delta</span>
                <span className={`text-lg font-mono font-extrabold block mt-1 tabular-nums ${
                  activeScenario.modeledOutputs.revenueDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeScenario.modeledOutputs.revenueDelta >= 0 ? '+' : ''}{activeScenario.modeledOutputs.revenueDelta}%
                </span>
              </div>

              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Gross Margin</span>
                <span className={`text-lg font-mono font-extrabold block mt-1 tabular-nums ${
                  activeScenario.modeledOutputs.grossMarginDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {activeScenario.modeledOutputs.grossMarginDelta >= 0 ? '+' : ''}{activeScenario.modeledOutputs.grossMarginDelta}% pts
                </span>
              </div>

              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Volume</span>
                <span className={`text-lg font-mono font-extrabold block mt-1 tabular-nums ${
                  (activeScenario.modeledOutputs.customerVolumeDelta ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(activeScenario.modeledOutputs.customerVolumeDelta ?? 0) >= 0 ? '+' : ''}{activeScenario.modeledOutputs.customerVolumeDelta ?? 0}%
                </span>
              </div>

              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Retention</span>
                <span className={`text-lg font-mono font-extrabold block mt-1 tabular-nums ${
                  (activeScenario.modeledOutputs.customerRetentionDelta ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(activeScenario.modeledOutputs.customerRetentionDelta ?? 0) >= 0 ? '+' : ''}{activeScenario.modeledOutputs.customerRetentionDelta ?? 0}%
                </span>
              </div>

              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Execution Risk</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block mt-1.5 ${getRiskBadge(activeScenario.modeledOutputs.executionRisk)}`}>
                  {activeScenario.modeledOutputs.executionRisk}
                </span>
              </div>

              <div className="cb-glass rounded-xl p-3">
                <span className="cb-meta text-slate-400 block">Payoff</span>
                <span className="text-sm font-bold text-slate-200 block mt-1.5 font-mono">
                  {activeScenario.timeToPayoffMonths} {activeScenario.timeToPayoffMonths === 1 ? 'month' : 'months'}
                </span>
              </div>
            </div>

            {/* Assumptions, Risks & Evidence Grounding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="cb-glass rounded-xl p-3.5 space-y-1.5">
                <span className="cb-meta text-cyan-400 block">
                  Key Assumptions
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {activeScenario.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="cb-glass rounded-xl p-3.5 space-y-1.5">
                <span className="cb-meta text-rose-400 block">
                  Primary Risks
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {activeScenario.downsides.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="cb-glass rounded-xl p-3.5 space-y-1.5">
                <span className="cb-meta text-emerald-400 block">
                  Supporting Evidence
                </span>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {activeScenario.supportingEvidenceRefs.map((ref) => (
                    <span key={ref} className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-mono text-[10px] font-bold">
                      {ref}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Risk Score:</span>
                  <span className="font-mono font-bold text-white">{activeScenario.modeledOutputs.riskScore ?? '—'}/100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Custom Sandbox — strategy laboratory */}
        <div className="cb-glass rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="cb-kicker text-slate-300 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Strategy Laboratory
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Live Price Elasticity: -1.8 (South) / -1.2 (General)
            </span>
          </div>

          {/* Baseline vs Scenario comparison — animated outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Baseline */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="cb-kicker text-slate-500">Baseline</span>
              <p className="text-[11px] text-slate-500 mt-1">Current trajectory with no intervention</p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Revenue</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">-4.2% / mo</span>
                </div>
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-400/80 rounded-full" style={{ width: '32%' }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Risk</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">High</span>
                </div>
              </div>
            </div>

            {/* Scenario — live computed */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4">
              <span className="cb-kicker text-amber-400">Scenario · Modelled Estimate</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Price {customParams.priceChangePercent}% · Marketing ₹{customParams.marketingBudgetLakhs}L · Discount {customParams.discountPercent}%
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">Revenue</span>
                  <span
                    className={`font-mono font-bold text-sm tabular-nums ${sandboxResults.revenueDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    style={{ transition: 'color 200ms ease' }}
                  >
                    {sandboxResults.revenueDelta >= 0 ? '+' : ''}{sandboxResults.revenueDelta}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sandboxResults.revenueDelta >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{
                      width: `${Math.min(100, Math.abs(sandboxResults.revenueDelta) * 6 + 4)}%`,
                      transition: 'width 300ms cubic-bezier(0.22,1,0.36,1), background-color 300ms ease',
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300">Risk</span>
                  <span
                    className={`font-mono font-bold text-sm ${sandboxResults.riskLevel === 'Low' ? 'text-emerald-400' : sandboxResults.riskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}
                  >
                    {sandboxResults.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="cb-meta text-slate-400">Price</span>
                <span className="font-mono font-bold text-amber-300">{customParams.priceChangePercent}%</span>
              </div>
              <input
                type="range"
                min="-15"
                max="10"
                step="1"
                value={customParams.priceChangePercent}
                onChange={(e) => setCustomParams({ ...customParams, priceChangePercent: Number(e.target.value) })}
                className="w-full accent-amber-500"
                aria-label="Price adjustment percent"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="cb-meta text-slate-400">Marketing</span>
                <span className="font-mono font-bold text-amber-300">₹{customParams.marketingBudgetLakhs}L</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.2"
                value={customParams.marketingBudgetLakhs}
                onChange={(e) => setCustomParams({ ...customParams, marketingBudgetLakhs: Number(e.target.value) })}
                className="w-full accent-amber-500"
                aria-label="Marketing co-op spend in lakhs"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="cb-meta text-slate-400">Discount</span>
                <span className="font-mono font-bold text-amber-300">{customParams.discountPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={customParams.discountPercent}
                onChange={(e) => setCustomParams({ ...customParams, discountPercent: Number(e.target.value) })}
                className="w-full accent-amber-500"
                aria-label="Promotional bundle discount percent"
              />
            </div>
          </div>

          {/* Full scenario output row (all four metrics, animated) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              ['Revenue', `${sandboxResults.revenueDelta >= 0 ? '+' : ''}${sandboxResults.revenueDelta}%`, sandboxResults.revenueDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'],
              ['Margin', `${sandboxResults.grossMarginDelta >= 0 ? '+' : ''}${sandboxResults.grossMarginDelta}%`, sandboxResults.grossMarginDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'],
              ['Volume', `${sandboxResults.customerVolumeDelta >= 0 ? '+' : ''}${sandboxResults.customerVolumeDelta}%`, sandboxResults.customerVolumeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'],
              ['Risk', sandboxResults.riskLevel, sandboxResults.riskLevel === 'Low' ? 'text-emerald-400' : sandboxResults.riskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'],
            ].map(([label, value, tone]) => (
              <div key={label} className="cb-glass rounded-xl p-3 text-center">
                <span className="cb-meta text-slate-500 block">{label}</span>
                <span className={`text-lg font-mono font-extrabold block mt-1 tabular-nums ${tone}`} style={{ transition: 'color 250ms ease' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

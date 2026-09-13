import React from 'react';
import {
  Radar,
  ShieldAlert,
  Sparkles,
  Globe2,
  Activity,
} from 'lucide-react';
import { UnifiedInvestigationState } from '../../types';
import { RiskRadar } from '../RiskRadar';
import { OpportunityRadar } from '../OpportunityRadar';
import { CompetitorIntelligence } from '../CompetitorIntelligence';
import { TrendRadar } from '../TrendRadar';
import { MarketIntelligence } from '../MarketIntelligence';
import {
  RISK_RADAR_ITEMS,
  OPPORTUNITY_RADAR_ITEMS,
  COMPETITOR_LANDSCAPE,
  TREND_RADAR_ITEMS,
  EMERGING_SIGNALS,
} from '../../mockData';

interface SignalsModuleProps {
  unifiedState: UnifiedInvestigationState;
}

/**
 * SIGNALS module — Risk Radar, Opportunity Radar, Competitive Intelligence,
 * Trend Radar. Everything the org should be watching beyond the decision.
 */
export const SignalsModule: React.FC<SignalsModuleProps> = ({ unifiedState }) => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <span className="cb-kicker text-amber-400/90 flex items-center gap-2">
          <Radar className="w-3.5 h-3.5" />
          Module · Signals
        </span>
        <h1 className="cb-display text-2xl sm:text-3xl text-white mt-1.5">
          Risk, Opportunity & Market Radars
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
          Six vulnerability vectors, four growth signals, and live category intelligence —
          each card expands into full mitigation or action detail.
        </p>
      </div>

      {/* Risk radar */}
      <div className="flex items-center gap-2 pt-1">
        <ShieldAlert className="w-4 h-4 text-rose-400" />
        <h2 className="cb-kicker text-slate-400">Risk Radar</h2>
      </div>
      <RiskRadar
        risks={RISK_RADAR_ITEMS}
        decisionConfidence={unifiedState.recommendationConfidence.overallScore}
      />

      {/* Opportunity radar */}
      <div className="flex items-center gap-2 pt-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h2 className="cb-kicker text-slate-400">Opportunity Radar</h2>
      </div>
      <OpportunityRadar opportunities={OPPORTUNITY_RADAR_ITEMS} />

      {/* Competitive intelligence */}
      <div className="flex items-center gap-2 pt-2">
        <Globe2 className="w-4 h-4 text-cyan-400" />
        <h2 className="cb-kicker text-slate-400">Competitive Intelligence</h2>
        <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 tracking-widest">
          DEMO RESEARCH SOURCE
        </span>
      </div>
      {unifiedState.marketIntelligence.length > 0 ? (
        <CompetitorIntelligence
          competitors={COMPETITOR_LANDSCAPE}
          signals={unifiedState.marketIntelligence}
        />
      ) : (
        <div className="cb-glass rounded-2xl p-5 text-xs text-slate-400">
          Market Search was not selected for this question; external claims are withheld.
        </div>
      )}

      {/* Market signals feed */}
      {unifiedState.marketIntelligence.length > 0 && (
        <MarketIntelligence signals={unifiedState.marketIntelligence} />
      )}

      {/* Trend radar */}
      <div className="flex items-center gap-2 pt-2">
        <Activity className="w-4 h-4 text-amber-400" />
        <h2 className="cb-kicker text-slate-400">Trend Radar</h2>
      </div>
      <TrendRadar trends={TREND_RADAR_ITEMS} signals={EMERGING_SIGNALS} />
    </div>
  );
};

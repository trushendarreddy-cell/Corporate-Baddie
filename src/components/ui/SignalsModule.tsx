import React from 'react';
import { UnifiedInvestigationState } from '../../types';
import { RiskRadar } from '../RiskRadar';
import { OpportunityRadar } from '../OpportunityRadar';
import { CompetitorIntelligence } from '../CompetitorIntelligence';
import { TrendRadar } from '../TrendRadar';
import { MarketIntelligence } from '../MarketIntelligence';
import { RISK_RADAR_ITEMS, OPPORTUNITY_RADAR_ITEMS, COMPETITOR_LANDSCAPE, TREND_RADAR_ITEMS, EMERGING_SIGNALS } from '../../mockData';

interface SignalsModuleProps { unifiedState: UnifiedInvestigationState; }

export const SignalsModule: React.FC<SignalsModuleProps> = ({ unifiedState }) => (
  <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 space-y-10">
    <div className="pb-6 border-b cb-hairline">
      <p className="cb-kicker">Module</p>
      <h1 className="cb-display text-[26px] sm:text-[32px] text-white mt-2">Signals</h1>
      <p className="text-[14px] text-slate-400 mt-2.5 max-w-xl leading-relaxed">Risk vectors, growth signals, and live category intelligence.</p>
    </div>
    <section><h2 className="cb-kicker">Risk Radar</h2><div className="mt-4"><RiskRadar risks={RISK_RADAR_ITEMS} decisionConfidence={unifiedState.recommendationConfidence.overallScore} /></div></section>
    <section><h2 className="cb-kicker">Opportunity Radar</h2><div className="mt-4"><OpportunityRadar opportunities={OPPORTUNITY_RADAR_ITEMS} /></div></section>
    <section>
      <div className="flex items-center gap-3"><h2 className="cb-kicker">Competitive Intelligence</h2><span className="cb-meta text-cyan-500/80">Demo research source</span></div>
      <div className="mt-4">{unifiedState.marketIntelligence.length > 0 ? <CompetitorIntelligence competitors={COMPETITOR_LANDSCAPE as any} signals={unifiedState.marketIntelligence} /> : <div className="text-[13px] text-slate-500 py-4">Market Search was not selected for this question; external claims are withheld.</div>}</div>
    </section>
    {unifiedState.marketIntelligence.length > 0 && <section><h2 className="cb-kicker">Market Signals</h2><div className="mt-4"><MarketIntelligence signals={unifiedState.marketIntelligence} /></div></section>}
    <section><h2 className="cb-kicker">Trend Radar</h2><div className="mt-4"><TrendRadar trends={TREND_RADAR_ITEMS as any} signals={EMERGING_SIGNALS as any} /></div></section>
  </div>
);

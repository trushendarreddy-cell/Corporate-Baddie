// ============================================================================
// CORPORATEBADDIE 2.0 - Failure Mode & Pre-Mortem Stress Engine
// Systematically evaluates failure modes, blind spots, grey-market contagion,
// and epistemic fragility before capital allocation.
// ============================================================================

export interface FailureMode {
  id: string;
  category: 'COMPETITOR_REACTION' | 'CHANNEL_FRICTION' | 'FINANCIAL_EROSION' | 'OPERATIONAL_BOTTLENECK';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  probabilityPercent: number;
  triggerCondition: string;
  cascadingImpact: string;
  preMortemNarrative: string;
  earlyWarningSignal: string;
  mitigationProtocol: string;
}

export interface OptionFailureProfile {
  optionId: string;
  optionName: string;
  overallVulnerabilityScore: number; // 0-100 (lower is safer)
  primaryFailureMode: string;
  failureModes: FailureMode[];
  worstCaseDownside: string;
  breakEvenProbability: number;
}

export const FAILURE_PROFILES: Record<string, OptionFailureProfile> = {
  'opt-1': {
    optionId: 'opt-1',
    optionName: 'Targeted Pricing & Regional Intervention (Recommended)',
    overallVulnerabilityScore: 28,
    primaryFailureMode: 'Cross-Regional Grey Market Arbitrage',
    breakEvenProbability: 82,
    worstCaseDownside:
      'If grey-market arbitrage leaks past 15%, regional margin compression could widen to -₹3.8L/month before regional quotas stabilize.',
    failureModes: [
      {
        id: 'fail-101',
        category: 'CHANNEL_FRICTION',
        title: 'Cross-Regional Grey Market Arbitrage',
        severity: 'MEDIUM',
        probabilityPercent: 24,
        triggerCondition: 'Regional discount in South exceeds North/West wholesale pricing by >12%',
        cascadingImpact: 'Dealers in North buy stock through Southern distributors, diluting full-price sales.',
        preMortemNarrative:
          'Six weeks in, Northern sales drop 8% as wholesalers exploit the regional rebate gap. Gross margin compresses across territories.',
        earlyWarningSignal: 'Bulk Southern orders shipping to shipping addresses in Maharashtra or Delhi.',
        mitigationProtocol: 'Impose strict dealer serial tracking and quota caps tied to verified local point-of-sale customer IDs.',
      },
      {
        id: 'fail-102',
        category: 'COMPETITOR_REACTION',
        title: 'Competitor Price War Escalation',
        severity: 'HIGH',
        probabilityPercent: 18,
        triggerCondition: 'NexaCorp matches bundle with an additional 10% cash rebate.',
        cascadingImpact: 'Rival price war forces continuous margin erosion in southern territory.',
        preMortemNarrative:
          'NexaCorp responds to our pilot by doubling down on introductory discounts, creating an unsustainable race to the bottom.',
        earlyWarningSignal: 'Competitor sales reps matching our promo sheet within 7 business days.',
        mitigationProtocol: 'Revert to product differentiation messaging and emphasize multi-year warranty bundle rather than price matching.',
      },
      {
        id: 'fail-103',
        category: 'OPERATIONAL_BOTTLENECK',
        title: 'Southern Hub Warehouse Stockout',
        severity: 'MEDIUM',
        probabilityPercent: 15,
        triggerCondition: 'Product A order volume exceeds 118% of Bangalore warehouse buffer stock.',
        cascadingImpact: 'Backorders lead to delivery delays, eroding customer satisfaction rebound.',
        preMortemNarrative:
          'Promotional campaign succeeds in generating demand, but stockouts push delivery times to 12 days, increasing customer cancellations.',
        earlyWarningSignal: 'Warehouse inventory dipping below 14 days of forward cover.',
        mitigationProtocol: 'Pre-position 2,500 units in Bangalore regional DC prior to marketing launch.',
      },
    ],
  },
  'opt-2': {
    optionId: 'opt-2',
    optionName: 'Marketing Expansion (Broad-Scale Awareness)',
    overallVulnerabilityScore: 68,
    primaryFailureMode: 'High Capital Burn with Low Conversion Velocity',
    breakEvenProbability: 44,
    worstCaseDownside:
      'Burn of ₹25.5L over 90 days with customer churn continuing unaddressed, resulting in net cash flow depletion.',
    failureModes: [
      {
        id: 'fail-201',
        category: 'FINANCIAL_EROSION',
        title: 'High CAC Dilution without Churn Resolution',
        severity: 'CRITICAL',
        probabilityPercent: 62,
        triggerCondition: 'Ad spend flows into generic nationwide channels while regional churn remains unaddressed.',
        cascadingImpact: 'High cost per acquisition fail to replace defecting high-LTV repeat buyers.',
        preMortemNarrative:
          'Three months in, ₹25L has been spent. While web visits rose 22%, net revenue still declined because existing accounts in South continued buying competitor bundles.',
        earlyWarningSignal: 'Top-of-funnel conversions up, but repeat 90-day retention curve remains flat or negative.',
        mitigationProtocol: 'Immediately cap digital ad spend at ₹3L/month and redirect to localized dealer co-op.',
      },
    ],
  },
  'opt-4': {
    optionId: 'opt-4',
    optionName: 'Do Nothing (Observe Organic Recovery)',
    overallVulnerabilityScore: 89,
    primaryFailureMode: 'Permanent Market Share Surrender',
    breakEvenProbability: 18,
    worstCaseDownside:
      'Permanent loss of Southern distributor accounts and annualized ARR loss of ₹50L+.',
    failureModes: [
      {
        id: 'fail-401',
        category: 'COMPETITOR_REACTION',
        title: 'Permanent Customer Habituation to Rival Bundles',
        severity: 'CRITICAL',
        probabilityPercent: 82,
        triggerCondition: 'Competitor discount runs for >60 days without corporate response.',
        cascadingImpact: 'High-value enterprise accounts redesign workflows around competitor product specifications.',
        preMortemNarrative:
          'Management waited for organic recovery. By Month 9, accounts completed their contract renewals with NexaCorp. Switching costs lock us out for 24 months.',
        earlyWarningSignal: 'Key account churn rate surpassing 15% in Q3.',
        mitigationProtocol: 'Enact intervention immediately before customer contract renewal windows close.',
      },
    ],
  },
};

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
    optionName: 'Company-wide Price Reduction',
    overallVulnerabilityScore: 78,
    primaryFailureMode: 'Enterprise-Wide Margin Destruction',
    breakEvenProbability: 38,
    worstCaseDownside:
      'Uncontrolled margin contraction of 350-420 bps across all SKUs, forfeiting ₹45L in annualized profit without reviving churned cohorts.',
    failureModes: [
      {
        id: 'fail-201',
        category: 'FINANCIAL_EROSION',
        title: 'Broad-Scale Margin Collapse',
        severity: 'CRITICAL',
        probabilityPercent: 74,
        triggerCondition: 'Blended gross margin floor drops below 36% across non-contested territories.',
        cascadingImpact: 'Permanent degradation of pricing power across Northern and Western enterprise accounts.',
        preMortemNarrative:
          'Prices were reduced nationally. Existing clients happily took discounts they never requested, accelerating margin erosion while defecting accounts still bought rival bundles.',
        earlyWarningSignal: 'Average Order Value (AOV) dropping faster than unit volume growth.',
        mitigationProtocol: 'Fence discount strictly behind localized distributor rebate tokens rather than global MSRP reductions.',
      },
      {
        id: 'fail-202',
        category: 'COMPETITOR_REACTION',
        title: 'Retaliatory Industry Price War',
        severity: 'HIGH',
        probabilityPercent: 52,
        triggerCondition: 'Category rivals view global discount as an aggressive attack on their market baseline.',
        cascadingImpact: 'Competitors discount secondary product tiers, eroding stable product lines.',
        preMortemNarrative:
          'Rivals responded in kind, lowering prices by an additional 5%. The entire sector lost pricing power for two consecutive fiscal quarters.',
        earlyWarningSignal: 'Competitor marketing campaigns announcing industry-wide price match guarantees.',
        mitigationProtocol: 'Pivot value proposition immediately to certified uptime SLAs and bundled enterprise support.',
      },
    ],
  },
  'opt-3': {
    optionId: 'opt-3',
    optionName: 'Marketing Blitz Campaign',
    overallVulnerabilityScore: 68,
    primaryFailureMode: 'High Capital Burn with Low Conversion Velocity',
    breakEvenProbability: 44,
    worstCaseDownside:
      'Burn of ₹25.5L over 90 days with customer churn continuing unaddressed, resulting in net cash flow depletion.',
    failureModes: [
      {
        id: 'fail-301',
        category: 'FINANCIAL_EROSION',
        title: 'High CAC Dilution without Churn Resolution',
        severity: 'CRITICAL',
        probabilityPercent: 62,
        triggerCondition: 'Ad spend flows into generic nationwide channels while regional churn remains unaddressed.',
        cascadingImpact: 'High cost per acquisition fails to replace defecting high-LTV repeat buyers.',
        preMortemNarrative:
          'Three months in, ₹25L has been spent. While web visits rose 22%, net revenue still declined because existing accounts in South continued buying competitor bundles.',
        earlyWarningSignal: 'Top-of-funnel conversions up, but repeat 90-day retention curve remains flat or negative.',
        mitigationProtocol: 'Immediately cap digital ad spend at ₹3L/month and redirect to localized dealer co-op programs.',
      },
      {
        id: 'fail-302',
        category: 'CHANNEL_FRICTION',
        title: 'Channel Partner Alienation',
        severity: 'MEDIUM',
        probabilityPercent: 35,
        triggerCondition: 'Direct-to-consumer ad campaigns bypass established regional dealer networks.',
        cascadingImpact: 'Distributors deprioritize in-store floor space for Product A.',
        preMortemNarrative:
          'Distributors reacted negatively to direct digital ads, retaliating by promoting competitor units on store display shelves.',
        earlyWarningSignal: 'Distributor order reorders slowing down despite increased brand impressions.',
        mitigationProtocol: 'Provide distributors with exclusive co-branded landing pages and lead routing incentives.',
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

/**
 * Safely retrieve a failure profile for any option ID, synthesizing a grounded fallback
 * if an option is not explicitly mapped.
 */
export function getFailureProfileForOption(optionId: string, fallbackName?: string): OptionFailureProfile {
  if (FAILURE_PROFILES[optionId]) {
    return FAILURE_PROFILES[optionId];
  }

  // Synthesize resilient fallback profile for custom or dynamic options
  const defaultTitle = fallbackName || `Strategic Option ${optionId}`;
  return {
    optionId,
    optionName: defaultTitle,
    overallVulnerabilityScore: 50,
    primaryFailureMode: 'Unmodeled Execution Friction',
    breakEvenProbability: 55,
    worstCaseDownside: 'Execution variance may deviate ±15% from forecasted targets prior to milestone validation.',
    failureModes: [
      {
        id: `fail-custom-${optionId}-1`,
        category: 'OPERATIONAL_BOTTLENECK',
        title: 'Cross-Functional Implementation Lag',
        severity: 'MEDIUM',
        probabilityPercent: 30,
        triggerCondition: 'Resource allocation across operational units takes >21 days.',
        cascadingImpact: 'Implementation delayed, reducing early milestone achievement.',
        preMortemNarrative: 'Cross-department handoffs delayed rollout by three weeks.',
        earlyWarningSignal: 'Milestone tracking checkpoints missing preliminary signoffs.',
        mitigationProtocol: 'Assign a designated operational owner with clear escalation protocols.',
      },
    ],
  };
}

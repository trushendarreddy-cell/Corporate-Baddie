// ============================================================================
// CORPORATEBADDIE 2.0 - Hostile Red-Team Audit Engine
// Simulates a skeptical board member, activist investor, or internal auditor
// who aggressively challenges assumptions, causal claims, and data integrity.
// ============================================================================

export interface HostileChallenge {
  id: string;
  claimId: string;
  attackerPersona: 'CFO / Skeptical Auditor' | 'Activist Investor' | 'Territory VP (Counter-claimant)' | 'Data Scientist';
  question: string;
  hostileHypothesis: string;
  adversarialSeverity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  corporateBaddieDefense: {
    verdict: 'DEFENDED WITH PROOF' | 'BOUNDED UNCERTAINTY' | 'SURRENDERED & ADJUSTED';
    evidentiaryProof: string;
    supportingDatasetRef: string;
    mathematicalTestUsed: string;
    confidenceAdjustment: string;
  };
}

export const HOSTILE_AUDIT_CHALLENGES: HostileChallenge[] = [
  {
    id: 'HA-001',
    claimId: 'CLAIM-017',
    attackerPersona: 'CFO / Skeptical Auditor',
    question: 'How do you know the -$3.05M revenue decline isn\'t just normal seasonal holiday lag or accounting cutoff timing?',
    hostileHypothesis: 'The decline is an accounting artifact of revenue recognition cutoff dates between Q1 and Q2.',
    adversarialSeverity: 'HIGH',
    corporateBaddieDefense: {
      verdict: 'DEFENDED WITH PROOF',
      evidentiaryProof:
        'Audited 78,420 invoice line items comparing identical YoY trailing 6-month windows. In prior years, seasonality accounted for ±2.4% variation. The current contraction is -14.2% (6.1 standard deviations below mean seasonality).',
      supportingDatasetRef: 'Sales Ledger (src-1) · Table fct_daily_revenue_v2 (Hash: 4f8b9c21e7d012a9)',
      mathematicalTestUsed: 'YoY Deseasonalized Z-Score Anomaly Isolation',
      confidenceAdjustment: 'No deduction. Empirical baseline verified at 98% certainty.',
    },
  },
  {
    id: 'HA-002',
    claimId: 'CLAIM-024',
    attackerPersona: 'Territory VP (Counter-claimant)',
    question: 'You claim Product A is the primary culprit. Isn\'t it possible that Product A fell simply because our sales team spent all their time selling Product B?',
    hostileHypothesis: 'Sales rep effort reallocation caused the Product A drop, not market demand decline.',
    adversarialSeverity: 'MEDIUM',
    corporateBaddieDefense: {
      verdict: 'DEFENDED WITH PROOF',
      evidentiaryProof:
        'Inbound customer search query volume and replenishment orders for Product A dropped 28% without rep contact. Meanwhile, marketing commission logs show sales reps maintained identical quota compensation for Product A throughout the period.',
      supportingDatasetRef: 'Marketing Attribution Ledger (src-3) & CRM Activities',
      mathematicalTestUsed: 'Sales Rep Effort Elasticity vs Organic Order Velocity Regression',
      confidenceAdjustment: 'Confirmed causal demand drop. Confidence sustained at 94%.',
    },
  },
  {
    id: 'HA-003',
    claimId: 'CLAIM-030',
    attackerPersona: 'Data Scientist',
    question: 'Your claim regarding competitor pricing is based on external market surveys. Isn\'t that correlation, not proof that their discounts caused our churn?',
    hostileHypothesis: 'Competitor promotions are a coincidence. Customer churn was driven by internal product quality defects.',
    adversarialSeverity: 'CRITICAL',
    corporateBaddieDefense: {
      verdict: 'BOUNDED UNCERTAINTY',
      evidentiaryProof:
        'Quality control telemetry confirms zero spike in RMA or product return rates (held steady at 0.8%). However, observational survey data cannot formally rule out other unmeasured macro factors. Thus, CorporateBaddie explicitly labels this link as [CORRELATION / ASSOCIATION] rather than deterministic causality, protecting the recommendation from over-claiming.',
      supportingDatasetRef: 'Customer 360 CDP (src-2) & Competitor Tracker API (src-5)',
      mathematicalTestUsed: 'Difference-in-Differences (DiD) between promo-exposed and non-exposed corridors',
      confidenceAdjustment: 'Epistemic guardrail applied: -4% penalty on external causal attribution.',
    },
  },
  {
    id: 'HA-004',
    claimId: 'CLAIM-031',
    attackerPersona: 'Activist Investor',
    question: 'Why spend ₹2.8L on targeted marketing when we could simply cut prices 15% across all products and win back market share tomorrow?',
    hostileHypothesis: 'Aggressive across-the-board discounting is simpler and eliminates competitor price advantage immediately.',
    adversarialSeverity: 'CRITICAL',
    corporateBaddieDefense: {
      verdict: 'DEFENDED WITH PROOF',
      evidentiaryProof:
        'Unit economics simulation demonstrates that a company-wide 10-15% price cut reduces gross margins from 42% down to 29.5%, sacrificing ₹2.4M in cash flow. Healthy lines (Product B & D) have low price elasticity and do not need discounting. Option 1 preserves ₹1.9M in margin.',
      supportingDatasetRef: 'Decision Room Simulation Model & SKU Unit Margin Ledgers',
      mathematicalTestUsed: 'Cross-Elasticity Margin Degradation Frontier',
      confidenceAdjustment: 'Board alternative formally rejected with mathematical proof.',
    },
  },
];

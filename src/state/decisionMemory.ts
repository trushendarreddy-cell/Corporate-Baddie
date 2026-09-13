// ============================================================================
// CORPORATEBADDIE 2.0 - Business Decision Memory Engine
// Tracks organizational decision records, predicted vs actual KPI outcomes,
// and epistemic feedback loops for institutional learning.
// ============================================================================

export interface DecisionMemoryRecord {
  id: string;
  runId: string;
  title: string;
  question: string;
  dateDecided: string;
  reviewDate: string;
  executiveSignoff: string;
  decidedOption: string;
  status: 'VALIDATED' | 'DEVIATING' | 'TRACKING';
  reason?: string;
  assumptions?: string[];
  predictedMetrics: {
    revenueDeltaPercent: number;
    grossMarginDeltaPercent?: number;
    customerRetentionDeltaPercent: number;
    customerVolumeDeltaPercent?: number;
    averageOrderValueDeltaPercent?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  actualMetrics: {
    revenueDeltaPercent: number;
    grossMarginDeltaPercent?: number;
    customerRetentionDeltaPercent: number;
    customerVolumeDeltaPercent?: number;
    averageOrderValueDeltaPercent?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  divergenceAnalysis: string;
  institutionalLearnings: string[];
  evidenceClaimIds: string[];
  confidenceAtDecision?: number;
  humanDecision?: string;
}

export const HISTORICAL_DECISION_MEMORY: DecisionMemoryRecord[] = [
  {
    id: 'DEC-2026-001',
    runId: 'RUN-002',
    title: 'H1 Regional Co-Op Dealer Incentive Pilot (South Hub)',
    question: 'Should we co-fund regional dealer marketing for Product A in southern hubs to arrest customer churn?',
    dateDecided: '2026-06-15',
    reviewDate: '2026-08-15',
    executiveSignoff: 'Priya Sharma (VP Commercial Ops)',
    decidedOption: 'Targeted Regional Value Bundle with ₹2.5L Dealer Co-Op',
    status: 'VALIDATED',
    predictedMetrics: {
      revenueDeltaPercent: 6.5,
      grossMarginDeltaPercent: -2.8,
      customerRetentionDeltaPercent: 4.5,
    },
    actualMetrics: {
      revenueDeltaPercent: 7.2,
      grossMarginDeltaPercent: -2.4,
      customerRetentionDeltaPercent: 5.1,
    },
    divergenceAnalysis:
      'Dealer adoption in Karnataka exceeded forecast (+18%). Retention rebound was slightly faster than projected due to bundled warranty incentive.',
    institutionalLearnings: [
      'Dealers are highly sensitive to co-op marketing speed; automated disbursement increased participation by 34%.',
      'Value bundles protect gross margins far better than direct price cuts.',
      'Customer churn stabilization begins at week 3 post-incentive launch.',
    ],
    evidenceClaimIds: ['CLM-017', 'CLM-024', 'CLM-028'],
  },
  {
    id: 'DEC-2025-004',
    runId: 'RUN-001',
    title: 'Q4 National Discount Experiment (Product B & C)',
    question: 'Should we run an across-the-board 10% holiday flash discount across all retail categories?',
    dateDecided: '2025-11-10',
    reviewDate: '2026-01-10',
    executiveSignoff: 'Rajesh Nair (Chief Commercial Officer)',
    decidedOption: 'Company-Wide 10% Promotional Price Cut',
    status: 'DEVIATING',
    predictedMetrics: {
      revenueDeltaPercent: 12.0,
      grossMarginDeltaPercent: -4.5,
      customerRetentionDeltaPercent: 2.0,
    },
    actualMetrics: {
      revenueDeltaPercent: 3.4,
      grossMarginDeltaPercent: -9.8,
      customerRetentionDeltaPercent: -1.2,
    },
    divergenceAnalysis:
      'Severe gross margin degradation without proportional volume lift. Existing customers delayed planned full-price orders, creating margin erosion rather than acquiring new accounts.',
    institutionalLearnings: [
      'Un-targeted discounts create customer expectation of permanent price drops.',
      'Gross margin collapsed 9.8 percentage points, requiring 5 months of corrective pricing.',
      'Never execute portfolio-wide cuts when volume decline is concentrated in a single SKU.',
    ],
    evidenceClaimIds: ['CLM-017'],
  },
  {
    id: 'DEC-2026-003',
    runId: 'RUN-003',
    title: 'Q2 Supply Chain Buffer Stock Allocation (Bangalore DC)',
    question: 'Should we pre-position 3,000 units of Product A inventory in the southern distribution center?',
    dateDecided: '2026-07-01',
    reviewDate: '2026-09-30',
    executiveSignoff: 'Amitav Sen (VP Supply Chain & Logistics)',
    decidedOption: 'Pre-position Buffer Stock with Dynamic Fulfillment Rerouting',
    status: 'TRACKING',
    predictedMetrics: {
      revenueDeltaPercent: 4.0,
      grossMarginDeltaPercent: -0.8,
      customerRetentionDeltaPercent: 3.0,
    },
    actualMetrics: {
      revenueDeltaPercent: 3.8,
      grossMarginDeltaPercent: -0.7,
      customerRetentionDeltaPercent: 2.6,
    },
    divergenceAnalysis:
      'Currently in-flight. Fulfillment cycle times dropped from 4.2 days to 1.8 days across Karnataka and Tamil Nadu accounts.',
    institutionalLearnings: [
      'Southern distributors prioritize 48-hour delivery reliability over minor wholesale discount differences.',
      'Inventory availability in regional DCs directly prevents churn to local competitors.',
    ],
    evidenceClaimIds: ['CLM-028', 'CLM-024'],
  },
];

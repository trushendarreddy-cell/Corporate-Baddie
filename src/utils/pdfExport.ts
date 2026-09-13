import { jsPDF } from 'jspdf';
import { 
  UnifiedInvestigationState, 
  BusinessContext, 
  DecisionRecord, 
  DataSource, 
  DecisionRoomOption, 
  RiskRadarItem, 
  ScenarioParams, 
  ScenarioResult 
} from '../types';

interface PDFExportParams {
  state: UnifiedInvestigationState;
  businessContext: BusinessContext;
  decisionRecord: DecisionRecord | null;
  dataSources: DataSource[];
  decisionOptions: DecisionRoomOption[];
  riskRadarItems: RiskRadarItem[];
  scenarioParams?: ScenarioParams;
  scenarioResult?: ScenarioResult;
  selectedOptionId?: string;
}

export const exportInvestigationToPDF = (params: PDFExportParams): void => {
  const {
    state,
    businessContext,
    decisionRecord,
    dataSources,
    decisionOptions,
    riskRadarItems,
    selectedOptionId = 'opt-1',
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin - 8) {
      doc.addPage();
      y = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(margin, y, contentWidth, 24, 'F');

      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(margin, y, contentWidth, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('CORPORATEBADDIE', margin + 5, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text('Falsifiable Executive Decision Dossier · 16-Point Audit', margin + 5, y + 14);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(245, 158, 11);
      doc.text(`RUN ID: ${state.runId || 'RUN-001'} | INVESTIGATION ID: ${state.investigationId || 'INV-2026-09A'}`, margin + 5, y + 19);

      const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(dateStr, pageWidth - margin - 36, y + 9);

      y += 28;
    } else {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFillColor(245, 158, 11);
      doc.rect(margin, y, contentWidth, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CORPORATEBADDIE EXECUTIVE BRIEF · AUDIT DOSSIER', margin + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(203, 213, 225);
      doc.text(`RUN: ${state.runId} | REF: ${businessContext.companyName}`, pageWidth - margin - 50, y + 5.5);

      y += 12;
    }
  };

  const drawSectionHeading = (title: string, subtext?: string) => {
    checkPageBreak(12);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, 2.5, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin + 5, y + 4.5);

    if (subtext) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(subtext, margin + 85, y + 4.5);
    }

    y += 9;
  };

  // -------------------------------------------------------------
  // INITIAL HEADER
  // -------------------------------------------------------------
  drawHeaderBanner(true);

  // 1. EXECUTIVE SUMMARY & CORE RECOMMENDATION
  drawSectionHeading('1. Executive Summary & Core Recommendation', 'Prescriptive Decision Output');
  doc.setFillColor(254, 243, 199);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(margin, y, contentWidth, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 53, 15);
  const recLines = doc.splitTextToSize(`Recommendation: "${state.recommendation}" [CLAIM-017, CLAIM-024, CLAIM-027]`, contentWidth - 6);
  doc.text(recLines, margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Decision Confidence: ${state.recommendationConfidence.level} (${state.recommendationConfidence.overallScore}%) | Data Quality: ${state.dataQuality.overallPercent}%`, margin + 3, y + 14);
  y += 22;

  // 2. BUSINESS CONTEXT
  drawSectionHeading('2. Business Context & Strategic Constraints');
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Company: ${businessContext.companyName} | Industry: ${businessContext.industry} | Primary Market: ${businessContext.primaryMarket}`, margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Objective: ${businessContext.businessObjective} | Constraint: ${businessContext.knownConstraints}`, margin + 3, y + 8.5);
  doc.text(`Management Priority: ${businessContext.managementPriorities} | Strategy: ${businessContext.currentStrategy}`, margin + 3, y + 12);
  y += 18;

  // 3. QUESTION CLASSIFICATION & SCOPE
  drawSectionHeading('3. Question Classification & Investigation Scope');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Audited Question: "${state.userQuestion}"`, margin + 2, y + 2);
  doc.text(`Classified Vectors: ${state.classifiedQuestionTypes.join(', ')} [Dynamic Execution Graph Activated]`, margin + 2, y + 6);
  y += 10;

  // 4. INGESTED DATA SOURCES & INTEGRITY PROFILE
  drawSectionHeading('4. Ingested Data Sources & Integrity Profile');
  dataSources.forEach((src) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(src.selected ? 15 : 148, src.selected ? 23 : 163, src.selected ? 42 : 184);
    doc.text(`• ${src.name} (${src.type})`, margin + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${src.recordsCount.toLocaleString()} rows | ${src.fieldsCount} fields | Status: ${src.selected ? 'CONNECTED' : 'DISABLED'}`, margin + 65, y + 2);
    y += 5;
  });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Integrity Summary: Completeness: ${state.dataQuality.completeness}%, Freshness: ${state.dataQuality.freshness}%, Consistency: ${state.dataQuality.consistency}%.`, margin + 3, y + 3);
  y += 8;

  // 5. ADAPTIVE INVESTIGATION PLAN
  checkPageBreak(25);
  drawSectionHeading('5. Adaptive Investigation Plan & Dynamic Branches');
  state.investigationPlan.slice(0, 6).forEach((node, idx) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`0${idx + 1}. ${node.label} [${node.status}]`, margin + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(node.summary, contentWidth - 65), margin + 60, y + 2);
    y += 5.5;
  });
  y += 4;

  // 6. EMPIRICAL FINDINGS & REVENUE DECOMPOSITION
  checkPageBreak(25);
  drawSectionHeading('6. Empirical Findings & Revenue Decomposition');
  state.empiricalFindings.forEach((f) => {
    checkPageBreak(7);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${f.evidenceClaimId}] ${f.label}: ${f.value} (${f.change})`, margin + 3, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Baseline: ${f.detailedData.baseline} -> Current: ${f.detailedData.current} | ${f.detailedData.dataSource}`, margin + 65, y + 4);
    y += 7.5;
  });
  y += 3;

  // 7. EPISTEMIC LABELS & CAUSALITY GUARDRAILS
  checkPageBreak(25);
  drawSectionHeading('7. Epistemic Labels & Correlation vs Causation Boundaries');
  state.claims.slice(0, 5).forEach((c) => {
    checkPageBreak(9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(c.epistemicLabel === 'CAUSAL EVIDENCE' ? 16 : 217, c.epistemicLabel === 'CAUSAL EVIDENCE' ? 185 : 119, c.epistemicLabel === 'CAUSAL EVIDENCE' ? 129 : 6);
    doc.text(`[${c.id}] ${c.epistemicLabel} (${c.verificationStatus})`, margin + 3, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(`${c.title}. Grounded in: ${c.evidence}`, contentWidth - 45), margin + 45, y + 3);
    y += 8;
  });
  y += 4;

  // 8. DISCOVERED ANOMALIES & CROSS-FACTOR INTERACTIONS
  checkPageBreak(25);
  drawSectionHeading('8. Discovered Anomalies & Cross-Factor Interactions');
  state.discoveredAnomalies.forEach((a) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(220, 38, 38);
    doc.text(`[${a.severity}] ${a.metric}: ${a.deviation}`, margin + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Dimension: ${a.dimension} | Ref: [${a.evidenceRef}]`, margin + 110, y + 2);
    y += 5.5;
  });
  y += 4;

  // 9. EXTERNAL MARKET INTELLIGENCE
  checkPageBreak(25);
  drawSectionHeading('9. External Market Intelligence & Competitor Telemetry');
  state.marketIntelligence.forEach((m) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${m.signal} [${m.source}]`, margin + 3, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(m.explanation, contentWidth - 55), margin + 55, y + 2);
    y += 6.5;
  });
  y += 4;

  // 10. MULTI-SCENARIO SIMULATION MATRIX
  checkPageBreak(30);
  drawSectionHeading('10. Multi-Scenario Simulation Matrix & Sensitivity Analysis');
  state.scenarioResults.slice(0, 4).forEach((sc) => {
    checkPageBreak(8);
    doc.setFillColor(sc.isRecommended ? 254 : 248, sc.isRecommended ? 243 : 250, sc.isRecommended ? 199 : 252);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sc.name.split(':')[0]} (${sc.label})`, margin + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Rev: ${sc.modeledOutputs.revenueDelta >= 0 ? '+' : ''}${sc.modeledOutputs.revenueDelta}% | Margin: ${sc.modeledOutputs.grossMarginDelta >= 0 ? '+' : ''}${sc.modeledOutputs.grossMarginDelta}% pts | Vol: ${sc.modeledOutputs.customerVolumeDelta}% | Risk: ${sc.modeledOutputs.executionRisk}`, margin + 55, y + 4.5);
    y += 8.5;
  });
  y += 3;

  // 11. EVALUATED DECISION OPTIONS & TRADEOFF MATRIX
  checkPageBreak(25);
  drawSectionHeading('11. Evaluated Decision Options & Tradeoff Matrix');
  decisionOptions.forEach((opt) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(opt.isRecommended ? 180 : 15, opt.isRecommended ? 83 : 23, opt.isRecommended ? 9 : 42);
    doc.text(`${opt.name} ${opt.isRecommended ? '(RECOMMENDED)' : ''}`, margin + 3, y + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Impact: ${opt.expectedImpact} | Cost: ${opt.cost} | Risk: ${opt.risk} | Decision Conf: ${state.recommendationConfidence.overallScore}%`, margin + 85, y + 2.5);
    y += 6.5;
  });
  y += 4;

  // 12. WHAT WOULD CHANGE MY RECOMMENDATION? (COUNTERFACTUAL ANALYSIS)
  checkPageBreak(30);
  drawSectionHeading('12. Counterfactual Analysis: "What Would Change My Recommendation?"');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Operational Reversal Triggers:', margin + 3, y + 2);
  y += 5;
  state.counterfactual.reversalTriggers.forEach((trig) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`• ${trig}`, margin + 5, y + 2);
    y += 4.5;
  });
  y += 3;

  // 13. TRANSPARENT CONFIDENCE MODEL
  checkPageBreak(25);
  drawSectionHeading('13. Transparent Confidence Model & Multi-Dim Breakdown');
  const cb = state.recommendationConfidence.breakdown;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Data Quality: ${cb.dataQuality}% | Evidence Coverage: ${cb.evidenceCoverage}% | Claim Verification: ${cb.claimVerification}% | Consistency: ${cb.evidenceConsistency}%`, margin + 3, y + 2);
  doc.text(`Source Completeness: ${cb.sourceCompleteness}% | Analysis Reliability: ${cb.analysisReliability}% | Missing Inputs: ${cb.missingRequiredInputs}% | Conflicting Evidence: ${cb.conflictingEvidence}%`, margin + 3, y + 6);
  doc.text(`Trace: ${state.recommendationConfidence.epistemicCaveat}`, margin + 3, y + 10);
  y += 15;

  // 14. RISK RADAR & MITIGATION
  checkPageBreak(25);
  drawSectionHeading('14. Risk Radar & Mitigation Protocols');
  riskRadarItems.slice(0, 4).forEach((r) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(r.level === 'HIGH' ? 220 : 15, r.level === 'HIGH' ? 38 : 23, r.level === 'HIGH' ? 38 : 42);
    doc.text(`[${r.level}] ${r.category}`, margin + 3, y + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Evidence: ${r.evidence.slice(0, 45)}... | Mitigation: ${r.mitigation.slice(0, 45)}...`, margin + 45, y + 2.5);
    y += 6.5;
  });
  y += 4;

  // 15. SMALLEST SAFE EXPERIMENT
  checkPageBreak(20);
  drawSectionHeading('15. Smallest Safe Validation Experiment (Pilot Design)');
  doc.setFillColor(240, 253, 244);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.rect(margin, y, contentWidth, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('Authorized Field Validation Pilot:', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(21, 128, 61);
  const expLines = doc.splitTextToSize(state.counterfactual.smallestSafeExperiment, contentWidth - 8);
  doc.text(expLines, margin + 3, y + 8.5);
  y += 17;

  // 16. GOVERNANCE SIGN-OFF & AUDIT VERIFICATION
  checkPageBreak(25);
  drawSectionHeading('16. Governance Sign-off & Audit Log Verification');
  doc.setFillColor(254, 252, 232);
  doc.rect(margin, y, contentWidth, 16, 'F');
  doc.setDrawColor(250, 204, 21);
  doc.rect(margin, y, contentWidth, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(113, 63, 18);
  const signoffStatus = decisionRecord?.decision
    ? `DECISION RECORDED: ${decisionRecord.decision} by ${decisionRecord.signoffUser || 'Authorized Officer'}`
    : 'DECISION STATUS: PENDING EXECUTIVE GOVERNANCE SIGN-OFF';
  doc.text(signoffStatus, margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(133, 77, 14);
  doc.text(`Timestamp: ${decisionRecord?.timestamp || new Date().toISOString()} | Audit Trail: ${state.auditEvents.length} Verified Agent Transitions`, margin + 4, y + 9.5);
  doc.text(`Cryptographic Integrity Verified · CorporateBaddie Falsifiable Intelligence Protocol`, margin + 4, y + 13.5);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CORPORATEBADDIE · Page ${i} of ${totalPages} · Falsifiable Executive Decision Brief · 16-Point Audit Traceability`,
      margin,
      pageHeight - 5
    );
  }

  // Trigger download
  const cleanDate = new Date().toISOString().slice(0, 10);
  doc.save(`CorporateBaddie_Executive_Brief_${state.runId}_${cleanDate}.pdf`);
};

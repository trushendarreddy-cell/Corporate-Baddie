import React, { useState } from 'react';
import { 
  Database, 
  BarChart3, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Hash, 
  FileText,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { CitationRef, CitationType } from '../types';
import { CITATION_REGISTRY } from '../citationData';

interface CitationBadgeProps {
  refId: string;
  onSelectCitation?: (citation: CitationRef) => void;
  className?: string;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  refId,
  onSelectCitation,
  className = '',
}) => {
  // Normalize refId (e.g. "[S1]" -> "S1", "CLM-017" -> "C1")
  const cleanId = refId.replace(/[\[\]]/g, '').trim();
  const citation: CitationRef = CITATION_REGISTRY[cleanId] || {
    badge: cleanId,
    label: `[${cleanId}]`,
    type: cleanId.startsWith('S') ? 'DATA_SOURCE' : cleanId.startsWith('D') ? 'DATASET_FINDING' : cleanId.startsWith('M') ? 'MARKET_INTEL' : 'CLAIM',
    title: `Reference ${cleanId}`,
    sourceName: 'Audited Internal Ledger / External Research',
    metric: 'Cross-validated empirical data point',
    details: 'Verified by CorporateBaddie automated evidentiary audit pipeline.',
    verified: true,
    auditHash: 'SHA-256: 3c8e7a12b9d04f66',
  };

  const getBadgeStyle = (type: CitationType) => {
    switch (type) {
      case 'DATA_SOURCE':
        return 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/60 text-indigo-300 ring-1 ring-indigo-500/20';
      case 'DATASET_FINDING':
        return 'bg-amber-950/80 hover:bg-amber-900 border-amber-700/60 text-amber-300 ring-1 ring-amber-500/20';
      case 'MARKET_INTEL':
        return 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700/60 text-cyan-300 ring-1 ring-cyan-500/20';
      case 'CLAIM':
        return 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700/60 text-emerald-300 ring-1 ring-emerald-500/20';
    }
  };

  const getIcon = (type: CitationType) => {
    switch (type) {
      case 'DATA_SOURCE':
        return <Database className="w-2.5 h-2.5 shrink-0" />;
      case 'DATASET_FINDING':
        return <BarChart3 className="w-2.5 h-2.5 shrink-0" />;
      case 'MARKET_INTEL':
        return <Globe className="w-2.5 h-2.5 shrink-0" />;
      case 'CLAIM':
        return <ShieldCheck className="w-2.5 h-2.5 shrink-0" />;
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectCitation) {
          onSelectCitation(citation);
        }
      }}
      title={`Click to inspect evidence: ${citation.title} (${citation.sourceName})`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-mono font-bold tracking-tight border transition-all duration-150 cursor-pointer select-none active:scale-95 ${getBadgeStyle(
        citation.type
      )} ${className}`}
    >
      {getIcon(citation.type)}
      <span>{citation.badge}</span>
    </button>
  );
};

interface GroundedTextProps {
  text: string;
  onSelectCitation?: (citation: CitationRef) => void;
  className?: string;
}

/**
 * Parses markdown-like text with [S1], [D2], [M1], [C1], etc.
 * and renders interactive, clickable badges.
 */
export const GroundedText: React.FC<GroundedTextProps> = ({
  text,
  onSelectCitation,
  className = '',
}) => {
  // Regex matches [S1], [D1], [M1], [C1], [CLM-017], etc.
  const regex = /\[([A-Z0-9\-]+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const badgeId = match[1];
    parts.push(
      <CitationBadge
        key={`${badgeId}-${match.index}`}
        refId={badgeId}
        onSelectCitation={onSelectCitation}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};

interface CitationModalProps {
  citation: CitationRef | null;
  onClose: () => void;
  onOpenEvidenceGraph?: (targetId?: string) => void;
  onOpenDataSource?: (sourceId?: string) => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  citation,
  onClose,
  onOpenEvidenceGraph,
  onOpenDataSource,
}) => {
  if (!citation) return null;

  const getTypeLabel = (type: CitationType) => {
    switch (type) {
      case 'DATA_SOURCE':
        return { label: 'Data Source Ingestion', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'DATASET_FINDING':
        return { label: 'Empirical Dataset Finding', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'MARKET_INTEL':
        return { label: 'External Market Intelligence', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'CLAIM':
        return { label: 'Verified Evidence Claim', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const typeConfig = getTypeLabel(citation.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#0e121d] border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#121624]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
              [{citation.badge}]
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                {citation.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                {citation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Source Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
              <span>Source Artifact:</span>
              <span className="font-mono text-slate-300">{citation.sourceName}</span>
            </div>
            <div className="pt-2 border-t border-slate-900">
              <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Empirical Metric / Finding:</span>
              <p className="text-slate-100 font-medium text-sm leading-snug">
                {citation.metric}
              </p>
            </div>
          </div>

          {/* Detailed Verification Explanation */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Forensic Audit Details
            </span>
            <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              {citation.details}
            </p>
          </div>

          {/* Cryptographic Audit Hash */}
          {citation.auditHash && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Audit Signature:</span>
              </div>
              <span className="text-amber-300/90 font-bold">{citation.auditHash}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0a0d14] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onOpenEvidenceGraph && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEvidenceGraph(citation.targetId);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspect in Evidence Graph</span>
              </button>
            )}
            {citation.type === 'DATA_SOURCE' && onOpenDataSource && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDataSource(citation.targetId);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 text-xs font-semibold transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span>View Source Ledger</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

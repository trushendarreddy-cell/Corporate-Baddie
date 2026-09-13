import React from 'react';
import { CitationRef } from '../types';
import { CitationBadge } from './CitationBadge';

interface GroundedTextProps {
  text: string;
  onSelectCitation?: (citation: CitationRef) => void;
  className?: string;
}

export const GroundedText: React.FC<GroundedTextProps> = ({
  text,
  onSelectCitation,
  className = '',
}) => {
  // Regex to match citation tokens like [D2, D3] or [S1] or [M1] or [C1]
  const citationRegex = /\[([A-Z0-9,\s]+)\]/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = citationRegex.exec(text)) !== null) {
    const preText = text.substring(lastIndex, match.index);
    if (preText) {
      parts.push(preText);
    }

    const citationsString = match[1];
    const citationIds = citationsString.split(',').map((s) => s.trim());

    parts.push(
      <span key={`cite-group-${match.index}`} className="inline-flex items-center gap-1 mx-1 align-baseline">
        {citationIds.map((id) => (
          <CitationBadge
            key={id}
            refId={id}
            onSelectCitation={onSelectCitation}
          />
        ))}
      </span>
    );

    lastIndex = citationRegex.lastIndex;
  }

  const remaining = text.substring(lastIndex);
  if (remaining) {
    parts.push(remaining);
  }

  return <span className={className}>{parts}</span>;
};

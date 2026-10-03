/**
 * Parsing for free-form LLM output.
 *
 * Models wrap JSON in markdown fences, add prose around it, emit trailing
 * commas, and return the wrong type for a field often enough that the parser
 * has to assume nothing. Everything here returns a shape the UI can render
 * directly, or null when there is nothing usable.
 *
 * Extracted from server/index.ts so it can be unit tested without booting the
 * API or reaching a provider.
 */

export interface Reasoning {
  summary: string;
  why: string[];
  recommendation: string;
  alternatives: string[];
  risks: string[];
  assumptions: string[];
  confidence: number | null;
  claimType: 'RECOMMENDATION' | 'INFERENCE';
}

const MAX_TEXT = 2000;
const MAX_LIST = 8;

export function parseReasoning(text: string): Reasoning | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  let value: unknown;
  try {
    value = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }

  // A bare array, string or number parses fine but has none of the fields we
  // need, so reject anything that is not a plain object.
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;

  const text_ = (input: unknown): string =>
    typeof input === 'string' ? input.slice(0, MAX_TEXT) : '';

  const strings = (input: unknown): string[] =>
    Array.isArray(input)
      ? input.filter((item): item is string => typeof item === 'string')
        .slice(0, MAX_LIST)
        .map((item) => item.slice(0, MAX_TEXT))
      : [];

  const rawConfidence = record.confidence;
  const confidence =
    rawConfidence === undefined || rawConfidence === null || rawConfidence === ''
      ? null
      : Number(rawConfidence);

  return {
    summary: text_(record.summary),
    why: strings(record.why),
    recommendation: text_(record.recommendation),
    alternatives: strings(record.alternatives),
    risks: strings(record.risks),
    assumptions: strings(record.assumptions),
    confidence:
      Number.isFinite(confidence as number)
        ? Math.max(0, Math.min(100, Math.round(confidence as number)))
        : null,
    // Allow-list rather than pass-through: an unexpected value must not reach
    // the UI as if it were a verified classification.
    claimType: record.claimType === 'RECOMMENDATION' ? 'RECOMMENDATION' : 'INFERENCE',
  };
}
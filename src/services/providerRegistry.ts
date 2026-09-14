import { GROUNDED_QA_PAIRS } from '../mockData';

export type ProviderStatus = 'ready' | 'fallback' | 'offline';

export interface ProviderAnswerContext {
  question: string;
  runId?: string;
  businessContext?: string;
  availableClaimIds?: string[];
}

export interface ProviderResult {
  text: string;
  referencedClaims: string[];
  providerId: string;
  providerName: string;
  status: ProviderStatus;
}

export interface GroundedProvider {
  id: string;
  name: string;
  priority: number;
  isAvailable: () => boolean;
  generateAnswer: (context: ProviderAnswerContext) => ProviderResult;
}

const buildUnsupportedAnswer = (question: string): ProviderResult => ({
  text:
    `I do not have a direct evidence-backed answer for that question in the current investigation. I can still help by narrowing the question to the evidence in this run, such as the main revenue driver, the region at risk, or the recommended next move.`,
  referencedClaims: [],
  providerId: 'evidence-fallback',
  providerName: 'Evidence Fallback Provider',
  status: 'fallback',
});

const demoGroundedProvider: GroundedProvider = {
  id: 'demo-grounded',
  name: 'Grounded Investigation Provider',
  priority: 1,
  isAvailable: () => true,
  generateAnswer: (context) => {
    const normalized = context.question.trim().toLowerCase();
    const match = GROUNDED_QA_PAIRS.find((qa) => {
      const candidate = qa.question.toLowerCase();
      return candidate.includes(normalized.slice(0, Math.min(normalized.length, 18))) || normalized.includes(candidate.slice(0, Math.min(candidate.length, 18)));
    });

    if (match) {
      return {
        text: match.answer,
        referencedClaims: match.referencedClaims,
        providerId: 'demo-grounded',
        providerName: 'Grounded Investigation Provider',
        status: 'ready',
      };
    }

    const safeClaims = (context.availableClaimIds ?? []).slice(0, 3);
    return {
      ...buildUnsupportedAnswer(context.question),
      referencedClaims: safeClaims,
      providerId: demoGroundedProvider.id,
      providerName: demoGroundedProvider.name,
      status: 'fallback',
    };
  },
};

const safeFallbackProvider: GroundedProvider = {
  id: 'safe-fallback',
  name: 'Safe Fallback Provider',
  priority: 2,
  isAvailable: () => true,
  generateAnswer: (context) => ({
    ...buildUnsupportedAnswer(context.question),
    providerId: safeFallbackProvider.id,
    providerName: safeFallbackProvider.name,
    status: 'fallback',
  }),
};

const defaultProviders: GroundedProvider[] = [demoGroundedProvider, safeFallbackProvider];

const readConfiguredOrder = (): string[] => {
  if (typeof window === 'undefined') return defaultProviders.map((p) => p.id);

  try {
    const raw = window.localStorage.getItem('cb-provider-order');
    if (!raw) return defaultProviders.map((p) => p.id);
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProviders.map((p) => p.id);
  } catch {
    return defaultProviders.map((p) => p.id);
  }
};

const providerMap = Object.fromEntries(defaultProviders.map((provider) => [provider.id, provider]));

export const getConfiguredProviders = (): GroundedProvider[] => {
  const configuredOrder = readConfiguredOrder();
  return configuredOrder
    .map((id) => providerMap[id])
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
};

export const askGroundedQuestion = (context: ProviderAnswerContext): ProviderResult => {
  const providers = getConfiguredProviders();

  for (const provider of providers) {
    if (!provider.isAvailable()) continue;

    try {
      const result = provider.generateAnswer(context);
      if (result?.text?.trim()) return result;
    } catch {
      // Continue to the next provider in the fallback chain.
    }
  }

  return safeFallbackProvider.generateAnswer(context);
};

export const PROVIDER_STATUS_SUMMARY = {
  activeProvider: demoGroundedProvider.name,
  fallbackChain: [demoGroundedProvider.name, safeFallbackProvider.name],
  defaultProviderId: demoGroundedProvider.id,
};

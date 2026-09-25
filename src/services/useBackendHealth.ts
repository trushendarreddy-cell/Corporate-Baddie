// ============================================================================
// BACKEND HEALTH HOOK
// Polls GET /api/health with bounded exponential backoff and exposes a
// connection status the UI can render (production-grade offline tolerance).
// ============================================================================

import { useEffect, useState } from 'react';
import { api } from './api';

export type BackendStatus = 'checking' | 'online' | 'offline';

export interface BackendHealth {
  status: BackendStatus;
  providers: { grok: boolean; gemini: boolean; zai: boolean; primary: string };
  version: string | null;
  lastCheckedAt: string | null;
  retry: () => void;
}

const INITIAL_DELAY_MS = 3_000;
const MAX_DELAY_MS = 30_000;

export function useBackendHealth(): BackendHealth {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const [providers, setProviders] = useState<BackendHealth['providers']>({ grok: false, gemini: false, zai: false, primary: 'grok' });
  const [version, setVersion] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;

    const probe = async (currentAttempt: number) => {
      try {
        const health = await api.health();
        if (cancelled) return;
        if (health.ok) {
          setStatus('online');
          setProviders({
            grok: Boolean(health.providers?.grok),
            gemini: Boolean(health.providers?.gemini),
            zai: Boolean(health.providers?.zai),
            primary: String(health.providers?.primary || 'grok'),
          });
          setVersion(health.version || null);
          setLastCheckedAt(new Date().toISOString());
          // Steady-state recheck every 60s.
          pollTimer = setTimeout(() => probe(0), 60_000);
          return;
        }
        throw new Error('unhealthy');
      } catch {
        if (cancelled) return;
        setStatus('offline');
        setLastCheckedAt(new Date().toISOString());
        const delay = Math.min(MAX_DELAY_MS, INITIAL_DELAY_MS * 2 ** currentAttempt);
        pollTimer = setTimeout(() => probe(currentAttempt + 1), delay);
      }
    };

    setStatus('checking');
    probe(attempt);

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [attempt, retryTick]);

  return {
    status,
    providers,
    version,
    lastCheckedAt,
    retry: () => {
      setAttempt(0);
      setRetryTick((t) => t + 1);
    },
  };
}

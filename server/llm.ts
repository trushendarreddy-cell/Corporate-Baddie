import 'dotenv/config';

type Provider = 'grok' | 'gemini' | 'zai';

export interface LLMRequest {
  system: string;
  prompt: string;
  useWebSearch?: boolean;
}

export interface LLMResult {
  provider: Provider;
  model: string;
  text: string;
  sources: Array<{ title?: string; url: string }>;
}

const REQUEST_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 30000);

function timeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

function extractGrokText(data: any): string {
  if (typeof data?.output_text === 'string') return data.output_text.trim();
  const output = Array.isArray(data?.output) ? data.output : [];
  return output
    .flatMap((item: any) => Array.isArray(item?.content) ? item.content : [])
    .filter((item: any) => item?.type === 'output_text' || item?.type === 'text')
    .map((item: any) => item?.text || '')
    .join('\n')
    .trim();
}

function extractGrokSources(data: any) {
  const sources: Array<{ title?: string; url: string }> = [];
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const sourceList = item?.action?.sources || item?.sources || [];
    if (!Array.isArray(sourceList)) continue;
    for (const source of sourceList) if (source?.url) sources.push({ title: source.title, url: source.url });
  }
  return sources.filter((source, index, all) => all.findIndex((item) => item.url === source.url) === index);
}

async function callGrok(request: LLMRequest): Promise<LLMResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY is not configured');
  const tools = request.useWebSearch ? [{ type: 'web_search' }] : undefined;
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.XAI_MODEL || 'grok-4.6',
      input: [
        { role: 'system', content: request.system },
        { role: 'user', content: request.prompt },
      ],
      ...(tools ? { tools } : {}),
    }),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Grok API ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  const data = await response.json();
  const text = extractGrokText(data);
  if (!text) throw new Error('Grok returned an empty response');
  return { provider: 'grok', model: data?.model || process.env.XAI_MODEL || 'grok-4.6', text, sources: extractGrokSources(data) };
}

async function callGemini(request: LLMRequest): Promise<LLMResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: request.system }] },
      contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
      generationConfig: { temperature: 0.1 },
    }),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Gemini API ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || '').join('\n').trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', text, sources: [] };
}

async function callZai(request: LLMRequest): Promise<LLMResult> {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) throw new Error('ZAI_API_KEY is not configured');
  const baseUrl = (process.env.ZAI_BASE_URL || 'https://api.z.ai/api/paas/v4').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.ZAI_MODEL || 'glm-5',
      messages: [
        { role: 'system', content: request.system },
        { role: 'user', content: request.prompt },
      ],
      temperature: 0.1,
    }),
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Z.ai API ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Z.ai returned an empty response');
  return { provider: 'zai', model: data?.model || process.env.ZAI_MODEL || 'glm-5', text, sources: [] };
}

export async function askLLM(request: LLMRequest): Promise<LLMResult> {
  const primary = (process.env.LLM_PRIMARY || 'grok').toLowerCase() as Provider;
  const providers: Provider[] = primary === 'gemini' ? ['gemini', 'grok', 'zai'] : primary === 'zai' ? ['zai', 'grok', 'gemini'] : ['grok', 'gemini', 'zai'];
  let lastError: unknown = null;
  for (const provider of providers) {
    try {
      if (provider === 'grok') return await callGrok(request);
      if (provider === 'gemini') return await callGemini(request);
      return await callZai(request);
    } catch (error) {
      lastError = error;
      console.warn(`${provider} provider failed:`, error instanceof Error ? error.message : error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All LLM providers failed');
}

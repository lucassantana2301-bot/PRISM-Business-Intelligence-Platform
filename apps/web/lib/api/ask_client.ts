/**
 * PRISM Client Ask PRISM API
 * Sends natural language questions to the server.
 */

import { AskPrismRequest, AskPrismResponse } from '@/lib/contracts/ask';

export async function askPrism(request: AskPrismRequest): Promise<AskPrismResponse> {
  const res = await fetch('/api/ask/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ask request failed' }));
    throw new Error(err.error || `Ask PRISM error (HTTP ${res.status})`);
  }

  return res.json();
}

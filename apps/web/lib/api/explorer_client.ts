/**
 * PRISM Client Explorer API
 * Client fetchers for interacting with explorer server routes.
 */

import {
  DatasetMetadata,
  ExplorerQuery,
  ExplorerQueryResult,
  ExplorerExportQuery,
} from '@/lib/contracts/explorer';

export async function fetchDatasetList(): Promise<(DatasetMetadata & { row_count: number })[]> {
  const res = await fetch('/api/explorer/datasets');
  if (!res.ok) {
    throw new Error('Failed to load available explorer datasets');
  }
  return res.json();
}

export async function fetchExplorerQuery(query: ExplorerQuery): Promise<ExplorerQueryResult> {
  const res = await fetch('/api/explorer/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Query failed' }));
    throw new Error(err.error || `Explorer query error (HTTP ${res.status})`);
  }

  return res.json();
}

export async function downloadExplorerCsv(query: ExplorerExportQuery): Promise<void> {
  const res = await fetch('/api/explorer/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Export failed' }));
    throw new Error(err.error || `Export error (HTTP ${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${query.dataset}_export.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

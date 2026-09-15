/**
 * PRISM Presentation Formatters
 * Pure visual formatting utilities separated from analytical calculations.
 */

import { FormatType } from '@/lib/contracts/analytics';

export function formatCurrency(value: number, compact: boolean = false): string {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  
  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInteger(value: number): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatRatio(value: number, suffix: string = 'x'): string {
  if (value === null || value === undefined || isNaN(value)) return `0.0${suffix}`;
  return `${value.toFixed(2)}${suffix}`;
}

export function formatMetricValue(value: number, type: FormatType = 'currency'): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'integer':
      return formatInteger(value);
    case 'ratio':
      return formatRatio(value);
    case 'decimal':
      return value !== null && value !== undefined && !isNaN(value) ? value.toFixed(2) : '0.00';
    default:
      return String(value);
  }
}

export function formatDelta(
  delta: number | null | undefined,
  formatType: 'percentage' | 'currency' | 'integer' | 'ratio' = 'percentage'
): string {
  if (delta === null || delta === undefined || isNaN(delta)) return '0.0%';
  
  const sign = delta > 0 ? '+' : '';
  if (formatType === 'percentage') {
    return `${sign}${delta.toFixed(1)}%`;
  }
  if (formatType === 'currency') {
    return `${sign}${formatCurrency(delta, true)}`;
  }
  if (formatType === 'integer') {
    return `${sign}${formatInteger(delta)}`;
  }
  return `${sign}${delta.toFixed(2)}`;
}

export function formatExecutionTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms)) return 'Indisponível';
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }
  return `${Math.round(ms).toLocaleString('en-US')} ms`;
}

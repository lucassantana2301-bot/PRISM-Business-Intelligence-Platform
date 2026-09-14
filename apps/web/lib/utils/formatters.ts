/**
 * PRISM Presentation Formatters
 * Pure visual formatting utilities separated from analytical calculations.
 */

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

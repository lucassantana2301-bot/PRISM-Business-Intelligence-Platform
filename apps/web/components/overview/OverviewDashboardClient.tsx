'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Percent,
  CreditCard,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/Badges';
import { DateRangeSelector, DateRangePreset, DATE_PRESETS } from './DateRangeSelector';
import { RevenueTrendCard } from './RevenueTrendCard';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { RegionalPerformanceCard } from './RegionalPerformanceCard';
import { ConversionFunnelCard } from './ConversionFunnelCard';
import { TopProductsCard } from './TopProductsCard';
import { InsightCard, InsightSeverity } from '@/components/ui/InsightCard';
import { TimeGrain } from '@/lib/contracts/analytics';
import {
  fetchOverviewDashboardData,
  OverviewDashboardData,
} from '@/lib/api/analytics';
import {
  formatCurrency,
  formatInteger,
  formatPercentage,
  formatDelta,
} from '@/lib/utils/formatters';

const kpiIcons = {
  gross_revenue: DollarSign,
  orders: ShoppingCart,
  conversion_rate: Percent,
  average_order_value: CreditCard,
};

export const OverviewDashboardClient: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [timeGrain, setTimeGrain] = useState<TimeGrain>('day');
  const [data, setData] = useState<OverviewDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeRange = DATE_PRESETS[selectedPreset];

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchOverviewDashboardData(
        activeRange.startDate,
        activeRange.endDate,
        timeGrain
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview analytics');
    } finally {
      setIsLoading(false);
    }
  }, [activeRange.startDate, activeRange.endDate, timeGrain]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset === '90d' || preset === 'ytd') {
      setTimeGrain('week');
    } else if (preset === 'full') {
      setTimeGrain('month');
    } else {
      setTimeGrain('day');
    }
  };

  const grossRevKpi = data?.kpis?.['gross_revenue'];
  const ordersKpi = data?.kpis?.['orders'];
  const convRateKpi = data?.kpis?.['conversion_rate'];
  const aovKpi = data?.kpis?.['average_order_value'];

  const deterministicSignals: {
    id: string;
    title: string;
    description: string;
    severity: InsightSeverity;
    metricLabel: string;
    metricValue: string;
    timestamp: string;
  }[] = data
    ? [
        {
          id: 'sig-1',
          title: 'Period Monetization Velocity',
          description: `Total gross merchandise revenue reached ${formatCurrency(
            grossRevKpi?.current_value || 0,
            true
          )} with an average basket size of ${formatCurrency(aovKpi?.current_value || 0)}.`,
          severity: (grossRevKpi?.is_favorable ? 'opportunity' : 'warning'),
          metricLabel: 'Net Delta',
          metricValue: formatDelta(grossRevKpi?.percentage_delta),
          timestamp: 'Live Query',
        },
        {
          id: 'sig-2',
          title: 'Funnel Conversion Health',
          description: `Store conversion rate is running at ${formatPercentage(
            convRateKpi?.current_value || 0
          )} across ${formatInteger(data.funnel[0]?.count || 0)} user sessions.`,
          severity: ((convRateKpi?.current_value || 0) >= 3.5 ? 'opportunity' : 'warning'),
          metricLabel: 'Conversion',
          metricValue: formatPercentage(convRateKpi?.current_value || 0),
          timestamp: 'Live Query',
        },
        {
          id: 'sig-3',
          title: 'Leading Category Contribution',
          description:
            data.categories.length > 0
              ? `${data.categories[0].name} leads merchandise distribution at ${data.categories[0].share}% of sales (${formatCurrency(
                  data.categories[0].revenue,
                  true
                )}).`
              : 'No category sales recorded.',
          severity: 'neutral',
          metricLabel: 'Top Dept',
          metricValue: data.categories[0]?.name || 'N/A',
          timestamp: 'Live Query',
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls: Date Preset Selector & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-prism-bg-card border border-prism-border-subtle shadow-prism-card">
        <DateRangeSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handlePresetChange}
          disabled={isLoading}
        />
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-[11px] font-mono text-prism-text-muted">
              Execution: {data.executionTimeMs}ms
            </span>
          )}
          <StatusBadge
            status={isLoading ? 'processing' : error ? 'warning' : 'synced'}
            label={isLoading ? 'Querying Engine...' : error ? 'API Error' : 'DuckDB Connected'}
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between shadow-prism-card">
          <div className="flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-900/60 hover:bg-rose-900 border border-rose-700/60 rounded-lg text-xs text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <MetricCard
          label="Gross Revenue"
          value={isLoading ? '—' : formatCurrency(grossRevKpi?.current_value || 0)}
          delta={grossRevKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={grossRevKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={kpiIcons.gross_revenue}
        />

        {/* Orders */}
        <MetricCard
          label="Total Orders"
          value={isLoading ? '—' : formatInteger(ordersKpi?.current_value || 0)}
          delta={ordersKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={ordersKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={kpiIcons.orders}
        />

        {/* Conversion Rate */}
        <MetricCard
          label="Conversion Rate"
          value={isLoading ? '—' : formatPercentage(convRateKpi?.current_value || 0)}
          delta={convRateKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={convRateKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={kpiIcons.conversion_rate}
        />

        {/* Average Order Value */}
        <MetricCard
          label="Average Order Value"
          value={isLoading ? '—' : formatCurrency(aovKpi?.current_value || 0)}
          delta={aovKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={aovKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={kpiIcons.average_order_value}
        />
      </div>

      {/* Deterministic Metric Signals Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-prism-text-muted font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-prism-accent-purple" aria-hidden="true" />
            Executive Signals (Computed Telemetry)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deterministicSignals.map((sig) => (
            <InsightCard
              key={sig.id}
              title={sig.title}
              description={sig.description}
              severity={sig.severity}
              metricLabel={sig.metricLabel}
              metricValue={sig.metricValue}
              timestamp={sig.timestamp}
            />
          ))}
        </div>
      </div>

      {/* Central Analytics Charts Grid: Revenue Trend + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendCard
            data={data?.trend || []}
            timeGrain={timeGrain}
            onTimeGrainChange={setTimeGrain}
            isLoading={isLoading}
          />
        </div>

        <div>
          <CategoryBreakdownCard
            data={data?.categories || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Lower Analytics Grid: Regional Performance + Conversion Funnel + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <RegionalPerformanceCard
            data={data?.regional || []}
            isLoading={isLoading}
          />
        </div>

        <div>
          <ConversionFunnelCard
            data={data?.funnel || []}
            isLoading={isLoading}
          />
        </div>

        <div>
          <TopProductsCard
            data={data?.topProducts || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

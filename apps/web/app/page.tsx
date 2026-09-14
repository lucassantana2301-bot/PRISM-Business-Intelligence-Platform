import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Percent,
  CreditCard,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { InsightCard } from '@/components/ui/InsightCard';
import { StatusBadge } from '@/components/ui/Badges';
import { RevenueTrendCard } from '@/components/overview/RevenueTrendCard';
import {
  mockExecutiveKPIs,
  mockRevenueTrendData,
  mockCategoryData,
  mockRegionalData,
  mockFunnelSteps,
  mockInsightsData,
} from '@/lib/mock/ecommerce';

const kpiIcons = {
  gross_revenue: DollarSign,
  orders: ShoppingCart,
  conversion_rate: Percent,
  average_order_value: CreditCard,
};

export default function ExecutiveOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Overview"
        description="High-level performance command center with multi-period comparative variance and metric telemetry."
        badge={<StatusBadge status="cached" label="Sample data" />}
      />

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockExecutiveKPIs.map((kpi) => {
          const Icon = kpiIcons[kpi.metricId as keyof typeof kpiIcons];
          return (
            <MetricCard
              key={kpi.metricId}
              label={kpi.label}
              value={kpi.formattedValue}
              delta={kpi.delta}
              comparisonLabel={kpi.comparisonLabel}
              isFavorable={kpi.isFavorable}
              icon={Icon}
              sparklineData={kpi.sparklineData}
            />
          );
        })}
      </div>

      {/* Autonomous Insights Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-prism-text-muted font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-prism-accent-purple" aria-hidden="true" />
            Example insights ({mockInsightsData.length} signals)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockInsightsData.slice(0, 3).map((insight) => (
            <InsightCard
              key={insight.id}
              title={insight.title}
              description={insight.description}
              severity={insight.severity}
              metricLabel={insight.metricLabel}
              metricValue={insight.metricValue}
              timestamp={insight.timestamp}
            />
          ))}
        </div>
      </div>

      {/* Central Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Trend Chart (Client Island) */}
        <div className="lg:col-span-2">
          <RevenueTrendCard data={mockRevenueTrendData} />
        </div>

        {/* Category Breakdown */}
        <div>
          <ChartCard
            title="Revenue by Category"
            subtitle="Distribution of sales across main categories (sample data)"
            footer={
              <div className="flex items-center justify-between w-full">
                <span>Top: Electronics ($342k)</span>
                <span className="text-emerald-400">+18.2% YoY</span>
              </div>
            }
          >
            <div className="h-64 w-full flex flex-col justify-between">
              <div className="space-y-3 pt-2">
                {mockCategoryData.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-prism-text-secondary truncate">{cat.name}</span>
                      <span className="text-prism-text-primary font-medium">
                        ${(cat.revenue / 1000).toFixed(1)}k ({cat.share}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-prism-bg-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Lower Row: Regional Performance & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Table */}
        <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-prism-text-primary">
                  Regional Performance
                </h3>
                <p className="text-xs text-prism-text-muted mt-0.5">
                  Revenue contribution and geographic expansion
                </p>
              </div>
              <span className="text-xs font-mono text-prism-accent-blue flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Top: SP</span>
              </span>
            </div>

            <div className="divide-y divide-prism-border-subtle/60">
              {mockRegionalData.map((reg) => (
                <div key={reg.region} className="py-2.5 flex items-center justify-between font-mono text-xs">
                  <div className="text-prism-text-primary font-sans">{reg.region}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-prism-text-secondary">{reg.revenue}</span>
                    <span className="text-prism-text-muted w-12 text-right">{reg.share}</span>
                    <span className="text-emerald-400 w-14 text-right font-medium">{reg.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* E-Commerce Funnel Step Breakdown */}
        <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-prism-text-primary">
                  Conversion Funnel Analysis
                </h3>
                <p className="text-xs text-prism-text-muted mt-0.5">
                  End-to-end user dropoff from session to order
                </p>
              </div>
              <span className="text-xs font-mono text-prism-text-muted">
                30-day aggregate
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {mockFunnelSteps.map((f) => (
                <div
                  key={f.step}
                  className="p-2 rounded bg-prism-bg-elevated/60 border border-prism-border-subtle/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-prism-text-primary font-sans text-xs">{f.step}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-prism-text-secondary">{f.count}</span>
                    <span className="text-prism-accent-blue font-medium w-14 text-right">{f.conversion}</span>
                    <span className="text-rose-400 text-[11px] w-14 text-right">{f.drop}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

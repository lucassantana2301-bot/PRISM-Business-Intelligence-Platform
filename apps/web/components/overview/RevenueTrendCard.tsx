'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';
import { SegmentedControl } from '@/components/ui/Controls';
import { TimeGrain } from '@/lib/contracts/analytics';
import { formatCurrency, formatInteger } from '@/lib/utils/formatters';

export interface TrendDataPoint {
  timestamp: string;
  date: string;
  net_revenue: number;
  orders: number;
  current: number;
  previous?: number;
}

export interface RevenueTrendCardProps {
  data: TrendDataPoint[];
  timeGrain: TimeGrain;
  onTimeGrainChange: (grain: TimeGrain) => void;
  isLoading?: boolean;
}

export const RevenueTrendCard: React.FC<RevenueTrendCardProps> = ({
  data,
  timeGrain,
  onTimeGrainChange,
  isLoading = false,
}) => {
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');

  // Find peak
  let peakVal = 0;
  let peakDate = '';
  data.forEach((d) => {
    const val = metricView === 'revenue' ? d.net_revenue : d.orders;
    if (val > peakVal) {
      peakVal = val;
      peakDate = d.date || d.timestamp;
    }
  });

  return (
    <ChartCard
      title="Revenue & Growth Trajectory"
      subtitle={`Canonical time-series aggregated by ${timeGrain}`}
      actions={
        <div className="flex items-center gap-2">
          {/* Time Grain selector */}
          <SegmentedControl
            options={[
              { id: 'day', label: 'Day' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
            ]}
            value={timeGrain}
            onChange={(val) => onTimeGrainChange(val as TimeGrain)}
            size="sm"
          />

          {/* Metric toggle */}
          <SegmentedControl
            options={[
              { id: 'revenue', label: 'Revenue' },
              { id: 'orders', label: 'Orders' },
            ]}
            value={metricView}
            onChange={(val) => setMetricView(val as 'revenue' | 'orders')}
            size="sm"
          />
        </div>
      }
      footer={
        <>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-prism-accent-blue" />
              <span>
                {metricView === 'revenue' ? 'Net Revenue ($)' : 'Completed Orders'}
              </span>
            </div>
          </div>
          {peakVal > 0 && (
            <span className="text-xs font-mono text-prism-text-secondary">
              Peak:{' '}
              <strong className="text-prism-text-primary">
                {metricView === 'revenue' ? formatCurrency(peakVal, true) : formatInteger(peakVal)}
              </strong>{' '}
              ({peakDate})
            </span>
          )}
        </>
      }
    >
      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center animate-pulse bg-prism-bg-card/40 rounded">
            <span className="text-xs font-mono text-prism-text-muted">Loading aggregated trajectory...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-prism-text-muted">
            No trajectory data in selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8A99AD"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#232733' }}
                tickFormatter={(d) => {
                  if (timeGrain === 'month') return d.substring(0, 7);
                  if (timeGrain === 'week') return d.substring(5);
                  return d.substring(5);
                }}
              />
              <YAxis
                stroke="#8A99AD"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#232733' }}
                tickFormatter={(val) =>
                  metricView === 'revenue' ? formatCurrency(val, true) : `${val}`
                }
              />
              <Tooltip
                formatter={(val: any) => [
                  metricView === 'revenue' ? formatCurrency(Number(val)) : formatInteger(Number(val)),
                  metricView === 'revenue' ? 'Net Revenue' : 'Orders',
                ]}
                labelFormatter={(l) => `Date: ${l}`}
                contentStyle={{
                  backgroundColor: '#11131A',
                  borderColor: '#363D4F',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey={metricView === 'revenue' ? 'net_revenue' : 'orders'}
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
};

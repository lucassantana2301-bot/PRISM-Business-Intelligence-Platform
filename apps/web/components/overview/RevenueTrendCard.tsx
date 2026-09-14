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
import { TimeSeriesDataPoint } from '@/lib/mock/ecommerce';

export interface RevenueTrendCardProps {
  data: TimeSeriesDataPoint[];
}

export const RevenueTrendCard: React.FC<RevenueTrendCardProps> = ({ data }) => {
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');

  return (
    <ChartCard
      title="Revenue & Growth Trajectory"
      subtitle="Comparing current 30 days against previous period benchmark (sample preview)"
      actions={
        <SegmentedControl
          options={[
            { id: 'revenue', label: 'Revenue' },
            { id: 'orders', label: 'Orders' },
          ]}
          value={metricView}
          onChange={(val) => setMetricView(val as 'revenue' | 'orders')}
          size="sm"
        />
      }
      footer={
        <>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-prism-accent-blue" />
              <span>Current 30 Days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600" />
              <span>Previous Period</span>
            </div>
          </div>
          <span>Peak: $42.3k (Oct 30)</span>
        </>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#232733' }}
            />
            <YAxis
              stroke="#8A99AD"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#232733' }}
              tickFormatter={(val) =>
                metricView === 'revenue' ? `$${(val / 1000).toFixed(0)}k` : `${val}`
              }
            />
            <Tooltip
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
              dataKey={metricView === 'revenue' ? 'previous' : 'orders'}
              stroke="#64748B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey={metricView === 'revenue' ? 'current' : 'orders'}
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

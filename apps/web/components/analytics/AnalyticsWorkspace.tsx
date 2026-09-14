'use client';

import React, { useState } from 'react';
import { Filter, Smartphone, Layers, Radio } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartCard } from '@/components/ui/ChartCard';
import { SegmentedControl } from '@/components/ui/Controls';
import {
  ChannelPerformance,
  DevicePerformance,
} from '@/lib/mock/ecommerce';

export interface AnalyticsWorkspaceProps {
  channelData: ChannelPerformance[];
  deviceData: DevicePerformance[];
}

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({
  channelData,
  deviceData,
}) => {
  const [timeGrain, setTimeGrain] = useState<'day' | 'week' | 'month'>('day');
  const [activeDimension, setActiveDimension] = useState<'channel' | 'category' | 'device'>('channel');

  return (
    <div className="space-y-6">
      {/* Filter Control Bar */}
      <div className="p-3 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-prism-text-muted mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            Slices:
          </span>

          <SegmentedControl
            options={[
              { id: 'channel', label: 'By Channel', icon: Radio },
              { id: 'device', label: 'By Device', icon: Smartphone },
              { id: 'category', label: 'By Category', icon: Layers },
            ]}
            value={activeDimension}
            onChange={(val) => setActiveDimension(val as any)}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-prism-text-muted">Grain:</span>
          <SegmentedControl
            options={[
              { id: 'day', label: 'Daily' },
              { id: 'week', label: 'Weekly' },
              { id: 'month', label: 'Monthly' },
            ]}
            value={timeGrain}
            onChange={(val) => setTimeGrain(val as any)}
            size="sm"
          />
        </div>
      </div>

      {/* Main Channel Performance Chart */}
      <ChartCard
        title="Revenue & Marketing Spend by Acquisition Channel"
        subtitle="Evaluating ROAS, gross revenue contribution, and ad spend efficiency (sample data)"
        footer={
          <div className="flex items-center justify-between w-full">
            <span>Highest Efficiency: Email Marketing (20.0x ROAS)</span>
            <span>Total Attributed Revenue: $847.3k</span>
          </div>
        }
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={channelData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
              <XAxis
                dataKey="channel"
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
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
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
              <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" name="Ad Spend" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle">
          <h3 className="text-sm font-medium text-prism-text-primary mb-1">
            Device Performance & Ticket Size
          </h3>
          <p className="text-xs text-prism-text-muted mb-4">
            Desktop retains higher Average Order Value vs Mobile in sample preview
          </p>

          <div className="space-y-3 font-mono text-xs">
            {deviceData.map((d) => (
              <div key={d.device} className="p-3 rounded bg-prism-bg-elevated/60 border border-prism-border-subtle/60 flex items-center justify-between">
                <span className="text-prism-text-primary font-sans">{d.device}</span>
                <div className="flex items-center gap-6">
                  <span className="text-prism-text-secondary">Share: {d.share}%</span>
                  <span className="text-prism-accent-blue">AOV: {d.aov}</span>
                  <span className="text-emerald-400">CR: {d.conversion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Summary Metrics */}
        <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle">
          <h3 className="text-sm font-medium text-prism-text-primary mb-1">
            Channel ROAS Efficiency Matrix
          </h3>
          <p className="text-xs text-prism-text-muted mb-4">
            Return on ad spend across sample marketing channels
          </p>

          <div className="divide-y divide-prism-border-subtle/60 font-mono text-xs">
            {channelData.map((c) => (
              <div key={c.channel} className="py-2.5 flex items-center justify-between">
                <span className="text-prism-text-secondary font-sans">{c.channel}</span>
                <div className="flex items-center gap-4">
                  <span className="text-prism-text-muted">{c.orders.toLocaleString()} orders</span>
                  <span className="text-prism-text-primary font-semibold w-16 text-right">{c.roas}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

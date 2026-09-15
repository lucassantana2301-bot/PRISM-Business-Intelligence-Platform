'use client';

import React, { useState } from 'react';
import { Filter, Smartphone, Layers, Radio, TrendingUp, DollarSign, Target, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatCurrency, formatInteger, formatPercentage } from '@/lib/utils/formatters';
import { ChannelPerformance, DevicePerformance } from '@/lib/mock/ecommerce';
import clsx from 'clsx';

import { CustomerCohortMatrix } from './CustomerCohortMatrix';

export interface AnalyticsWorkspaceProps {
  channelData: ChannelPerformance[];
  deviceData: DevicePerformance[];
}

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({
  channelData,
  deviceData,
}) => {
  const [activeDimension, setActiveDimension] = useState<'channel' | 'device'>('channel');

  return (
    <div className="space-y-8">
      {/* Customer Cohort Matrix Heatmap */}
      <CustomerCohortMatrix />

      {/* Dimension Switcher Control Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-prism-indigo" />
            Dimensão Ativa:
          </span>

          <div role="group" className="inline-flex p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80">
            <button
              type="button"
              onClick={() => setActiveDimension('channel')}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5',
                activeDimension === 'channel'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Canais de Aquisição</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDimension('device')}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5',
                activeDimension === 'device'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Dispositivos</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Atribuição Multi-Toque Canônica</span>
        </div>
      </section>

      {/* Main Attribution Visual Surface */}
      <section className="prism-panel-master p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <AnalyticalCoordinate dimension="monetary">
              DIM.01 · ACQUISITION ATTRIBUTION & ROAS
            </AnalyticalCoordinate>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
              Desempenho Comercial por {activeDimension === 'channel' ? 'Canal de Marketing' : 'Tipo de Dispositivo'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Receita bruta atribuída versus investimento publicitário e retorno sobre gasto (ROAS)
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-600 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
            <span>Eficiência Máxima:</span>
            <strong className="text-emerald-700 font-bold">Email (20.0x ROAS)</strong>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeDimension === 'channel' ? channelData : deviceData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey={activeDimension === 'channel' ? 'channel' : 'device'}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(83, 97, 255, 0.04)' }}
                contentStyle={{
                  backgroundColor: '#080c16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.4)',
                  fontSize: '12px',
                  color: '#f8fafc',
                  fontFamily: 'ui-monospace, monospace',
                  padding: '8px 12px',
                }}
                formatter={(val: any, name: any) => [
                  formatCurrency(Number(val)),
                  name === 'revenue' ? 'Receita Atribuída' : 'Investimento em Ads',
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="revenue" name="Receita" fill="#5361ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" name="Investimento" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Breakdown Grid: Device & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Performance Card */}
        <div className="prism-panel-master p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <AnalyticalCoordinate dimension="structural">DIM.02 · DEVICE DISPERSION</AnalyticalCoordinate>
            <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
              Distribuição por Dispositivo
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 mb-6">
              Participação no faturamento e ticket médio por plataforma
            </p>

            <div className="space-y-3 font-mono text-xs">
              {deviceData.map((d) => (
                <div
                  key={d.device}
                  className="p-3.5 rounded-xl border border-slate-100 bg-[#fbfcfd] flex items-center justify-between"
                >
                  <span className="text-slate-800 font-sans font-semibold text-xs">{d.device}</span>
                  <div className="flex items-center gap-6 tabular-nums">
                    <span className="text-slate-500">Share: <strong>{d.share}%</strong></span>
                    <span className="text-prism-indigo font-bold">AOV: {d.aov}</span>
                    <span className="text-emerald-700 font-semibold">CR: {d.conversion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Summary Metrics */}
        <div className="prism-panel-master p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <AnalyticalCoordinate dimension="monetary">DIM.03 · ROAS EFFICIENCY</AnalyticalCoordinate>
            <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
              Matriz de Eficiência ROAS
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 mb-6">
              Retorno sobre gasto publicitário consolidado
            </p>

            <div className="divide-y divide-slate-100 font-mono text-xs">
              {channelData.map((c) => (
                <div key={c.channel} className="py-3 flex items-center justify-between">
                  <span className="text-slate-800 font-sans font-medium">{c.channel}</span>
                  <div className="flex items-center gap-4 tabular-nums">
                    <span className="text-slate-400">{formatInteger(c.orders)} pedidos</span>
                    <span className="px-2.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {c.roas === 'N/A' ? 'Orgânico' : `${c.roas} ROAS`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { MapPin, TrendingUp, Truck, DollarSign, Filter, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatCurrency, formatInteger, formatPercentage } from '@/lib/utils/formatters';
import { soundEffects } from '@/lib/utils/soundEffects';
import clsx from 'clsx';

export interface StateData {
  uf: string;
  name: string;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste' | 'Norte';
  revenue: number;
  orders: number;
  share: number;
  aov: number;
  avgFreightDays: number;
  returnRate: number;
}

const BRAZIL_STATES_DATA: StateData[] = [
  { uf: 'SP', name: 'São Paulo', region: 'Sudeste', revenue: 389368, orders: 346, share: 45.0, aov: 1125.34, avgFreightDays: 1.8, returnRate: 1.4 },
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', revenue: 155747, orders: 139, share: 18.0, aov: 1120.48, avgFreightDays: 2.6, returnRate: 1.9 },
  { uf: 'MG', name: 'Minas Gerais', region: 'Sudeste', revenue: 103831, orders: 93, share: 12.0, aov: 1116.46, avgFreightDays: 3.1, returnRate: 1.6 },
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'Sul', revenue: 60568, orders: 54, share: 7.0, aov: 1121.63, avgFreightDays: 3.8, returnRate: 1.2 },
  { uf: 'PR', name: 'Paraná', region: 'Sul', revenue: 51915, orders: 46, share: 6.0, aov: 1128.58, avgFreightDays: 3.4, returnRate: 1.3 },
  { uf: 'SC', name: 'Santa Catarina', region: 'Sul', revenue: 34610, orders: 31, share: 4.0, aov: 1116.45, avgFreightDays: 3.2, returnRate: 1.1 },
  { uf: 'BA', name: 'Bahia', region: 'Nordeste', revenue: 25957, orders: 24, share: 3.0, aov: 1081.54, avgFreightDays: 5.2, returnRate: 2.1 },
  { uf: 'PE', name: 'Pernambuco', region: 'Nordeste', revenue: 17305, orders: 15, share: 2.0, aov: 1153.66, avgFreightDays: 5.4, returnRate: 2.3 },
  { uf: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', revenue: 15574, orders: 13, share: 1.8, aov: 1198.0, avgFreightDays: 2.9, returnRate: 1.0 },
  { uf: 'GO', name: 'Goiás', region: 'Centro-Oeste', revenue: 10383, orders: 10, share: 1.2, aov: 1038.3, avgFreightDays: 4.1, returnRate: 1.8 },
];

export const BrazilGeoHeatmap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'freight'>('revenue');

  const filteredStates = BRAZIL_STATES_DATA.filter(
    (s) => selectedRegion === 'Todos' || s.region === selectedRegion
  ).sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'orders') return b.orders - a.orders;
    return a.avgFreightDays - b.avgFreightDays;
  });

  const totalFilteredRevenue = filteredStates.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="prism-panel-master p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <AnalyticalCoordinate dimension="structural">
            GEO.01 · BRAZILIAN GEOGRAPHIC TELEMETRY
          </AnalyticalCoordinate>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MapPin className="h-6 w-6 text-prism-cyanDark" />
            Radar Geográfico de Vendas & Logística (Brasil)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Distribuição de faturamento estadual, participação de mercado e eficiência de prazo de entrega
          </p>
        </div>

        {/* Region Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div role="group" className="inline-flex p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80 text-xs font-medium">
            {['Todos', 'Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste'].map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedRegion(region);
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-md transition-all duration-150',
                  selectedRegion === region
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Concentração Sudeste</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">75.0% do GMV</div>
            <span className="text-xs text-slate-500 font-mono mt-0.5">SP, RJ e MG lideram faturamento</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Prazo Médio de Frete</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">2.4 Dias Úteis</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> SLA de 98.6% no prazo
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Truck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Maior Ticket Médio Regional</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">Distrito Federal (DF)</div>
            <span className="text-xs text-indigo-600 font-mono mt-0.5">R$ 1.198,00 / pedido</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-prism-indigo">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* State List Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200/80 text-slate-700 font-mono uppercase text-2xs tracking-wider">
              <th className="py-3 px-4 font-bold">Estado (UF)</th>
              <th className="py-3 px-3 font-bold">Região</th>
              <th className="py-3 px-4 font-bold text-right cursor-pointer" onClick={() => setSortBy('revenue')}>
                Faturamento (GMV) {sortBy === 'revenue' && '↓'}
              </th>
              <th className="py-3 px-4 font-bold text-right cursor-pointer" onClick={() => setSortBy('orders')}>
                Volume de Pedidos {sortBy === 'orders' && '↓'}
              </th>
              <th className="py-3 px-4 font-bold text-center">Share do Total</th>
              <th className="py-3 px-4 font-bold text-right">Ticket Médio</th>
              <th className="py-3 px-4 font-bold text-center cursor-pointer" onClick={() => setSortBy('freight')}>
                Prazo Frete {sortBy === 'freight' && '↑'}
              </th>
              <th className="py-3 px-4 font-bold text-right">Taxa Devolução</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-mono">
            {filteredStates.map((st) => (
              <tr key={st.uf} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-slate-900 text-white font-mono text-2xs font-bold flex items-center justify-center">
                    {st.uf}
                  </span>
                  <span>{st.name}</span>
                </td>
                <td className="py-3 px-3 text-slate-500 font-sans">
                  {st.region}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                  {formatCurrency(st.revenue)}
                </td>
                <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                  {formatInteger(st.orders)} pedidos
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-prism-indigo rounded-full"
                        style={{ width: `${Math.min(100, st.share * 2.2)}%` }}
                      />
                    </div>
                    <span className="text-2xs font-bold text-slate-700 w-8 text-right">
                      {st.share.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                  {formatCurrency(st.aov)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {st.avgFreightDays} dias
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-slate-500 tabular-nums">
                  {st.returnRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

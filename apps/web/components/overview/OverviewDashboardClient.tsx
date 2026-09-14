'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Percent,
  CreditCard,
  Zap,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { DateRangeSelector, DateRangePreset, DATE_PRESETS } from './DateRangeSelector';
import { RevenueTrendCard } from './RevenueTrendCard';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
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
      setError(err.message || 'Falha ao carregar métricas executivas');
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
          title: 'Velocidade de Monetização do Período',
          description: `A receita bruta total de mercadorias atingiu US$ ${(
            (grossRevKpi?.current_value || 0) / 1000
          ).toFixed(1)} mil, com um valor médio de compra de ${formatCurrency(
            aovKpi?.current_value || 0
          )}.`,
          severity: 'warning',
          metricLabel: 'Delta líquido',
          metricValue: formatDelta(grossRevKpi?.percentage_delta),
          timestamp: 'Consulta ao vivo',
        },
        {
          id: 'sig-2',
          title: 'Saúde da conversão do funil',
          description: `A taxa de conversão da loja está em ${formatPercentage(
            convRateKpi?.current_value || 0
          )} em ${formatInteger(data.funnel[0]?.count || 0)} sessões de usuários.`,
          severity: 'opportunity',
          metricLabel: 'Conversão',
          metricValue: formatPercentage(convRateKpi?.current_value || 0),
          timestamp: 'Consulta ao vivo',
        },
        {
          id: 'sig-3',
          title: 'Contribuição líder na categoria',
          description:
            data.categories.length > 0
              ? `A distribuição de produtos de ${data.categories[0].name.toLowerCase()} representa ${
                  data.categories[0].share
                }% das vendas (US$ ${(data.categories[0].revenue / 1000).toFixed(1)} mil).`
              : 'Nenhuma venda de categoria registrada.',
          severity: 'neutral',
          metricLabel: 'Departamento principal',
          metricValue: data.categories[0]?.name || 'N/D',
          timestamp: 'Consulta ao vivo',
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Executive Page Header Banner with Abstract Flow Wave */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden pt-2 pb-2">
        <div className="space-y-1 z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Visão geral <span className="text-blue-600">executiva</span>
          </h1>
          <p className="text-sm text-slate-500 font-sans max-w-2xl">
            Central de comando de alto desempenho conectada ao mecanismo canônico de análise semântica DuckDB.
          </p>
        </div>

        {/* Decorative Wave & Slogan on Top Right */}
        <div className="hidden lg:flex items-center gap-6 z-10">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-600 font-sans">
              Dados hoje.
            </div>
            <div className="text-xs text-slate-400 font-sans">
              Decisões melhores amanhã.
            </div>
          </div>
          {/* Subtle Abstract Wave Graphic */}
          <svg
            className="w-36 h-12 text-blue-500/30 overflow-visible"
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 20 C 30 5, 60 35, 90 15 C 105 5, 115 25, 120 20"
              stroke="url(#top-wave-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M10 25 C 40 10, 70 30, 100 10 C 110 5, 115 15, 120 12"
              stroke="url(#top-wave-grad-2)"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="top-wave-grad" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="top-wave-grad-2" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#60a5fa" stopOpacity="0.4" />
                <stop offset="1" stopColor="#c084fc" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Date Filter & Execution Status Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
        <DateRangeSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handlePresetChange}
          disabled={isLoading}
        />
        <div className="flex items-center gap-3 shrink-0">
          {data && (
            <span className="text-xs font-sans text-slate-500">
              Tempo de execução: <strong className="font-semibold text-slate-700">{data.executionTimeMs} ms</strong>
            </span>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DuckDB Conectado</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl text-xs text-rose-800 transition-colors font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Receita Bruta */}
        <MetricCard
          label="RECEITA BRUTA"
          value={isLoading ? '—' : formatCurrency(grossRevKpi?.current_value || 0)}
          delta={grossRevKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={grossRevKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          sparklineColor="#6366f1"
          sparklineData={[15, 25, 20, 38, 30, 48, 42, 60, 52, 75]}
        />

        {/* Total de Pedidos */}
        <MetricCard
          label="TOTAL DE PEDIDOS"
          value={isLoading ? '—' : formatInteger(ordersKpi?.current_value || 0)}
          delta={ordersKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={ordersKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={ShoppingCart}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          sparklineColor="#8b5cf6"
          sparklineData={[10, 18, 14, 28, 24, 38, 32, 48, 42, 58]}
        />

        {/* Taxa de Conversão */}
        <MetricCard
          label="TAXA DE CONVERSÃO"
          value={isLoading ? '—' : formatPercentage(convRateKpi?.current_value || 0)}
          delta={convRateKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={convRateKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={Percent}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          sparklineColor="#10b981"
          sparklineData={[2.8, 3.2, 3.0, 3.8, 3.5, 4.1, 3.9, 4.3, 4.0, 4.23]}
        />

        {/* Valor Médio do Pedido (AOV) */}
        <MetricCard
          label="VALOR MÉDIO DO PEDIDO"
          value={isLoading ? '—' : formatCurrency(aovKpi?.current_value || 0)}
          delta={aovKpi?.percentage_delta ?? null}
          comparisonLabel={activeRange.comparisonLabel}
          isFavorable={aovKpi?.is_favorable ?? true}
          loading={isLoading}
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          sparklineColor="#f59e0b"
          sparklineData={[1280, 1220, 1250, 1180, 1150, 1120, 1140, 1100, 1080, 1092.46]}
        />
      </div>

      {/* Sinais Executivos (Telemetria Computadorizada) Strip */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              SINAIS EXECUTIVOS (TELEMETRIA COMPUTADORIZADA)
            </span>
          </div>

          <Link
            href="/insights"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 font-sans transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
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

      {/* Corporate System Footer */}
      <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans">
        <div>
          PRISM — Inteligência de dados para um futuro mais claro.
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">Sistema operacional</span>
          <span>|</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};


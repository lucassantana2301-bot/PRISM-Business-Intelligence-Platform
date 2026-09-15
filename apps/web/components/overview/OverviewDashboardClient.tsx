'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Clock, Database, RefreshCw, Zap } from 'lucide-react';
import { DateRangePreset, DATE_PRESETS, DateRangeSelector } from './DateRangeSelector';
import { RevenueTrendCard } from './RevenueTrendCard';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { SourceRefraction } from './SourceRefraction';
import { IntelligenceBrief, IntelligenceSignal } from './IntelligenceBrief';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { TimeGrain } from '@/lib/contracts/analytics';
import { fetchOverviewDashboardData, OverviewDashboardData } from '@/lib/api/analytics';
import { formatCurrency, formatDelta, formatExecutionTime, formatPercentage } from '@/lib/utils/formatters';

export const OverviewDashboardClient: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [timeGrain, setTimeGrain] = useState<TimeGrain>('day');
  const [data, setData] = useState<OverviewDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRange = DATE_PRESETS[selectedPreset];

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchOverviewDashboardData(activeRange.startDate, activeRange.endDate, timeGrain));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar métricas executivas');
    } finally {
      setIsLoading(false);
    }
  }, [activeRange.endDate, activeRange.startDate, timeGrain]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    setTimeGrain(preset === '90d' || preset === 'ytd' ? 'week' : preset === 'full' ? 'month' : 'day');
  };

  const grossRevenue = data?.kpis.gross_revenue;
  const orders = data?.kpis.orders;
  const conversion = data?.kpis.conversion_rate;
  const averageOrderValue = data?.kpis.average_order_value;
  const leadingCategory = data?.categories[0];

  const signals: IntelligenceSignal[] = data
    ? [
        {
          id: 'revenue-momentum',
          coordinate: 'SIG.01',
          finding:
            grossRevenue?.percentage_delta == null
              ? 'Receita sem período comparável'
              : `Receita ${grossRevenue.percentage_delta >= 0 ? 'acelerou' : 'recuou'} no período selecionado`,
          evidence:
            grossRevenue?.percentage_delta == null
              ? `A receita bruta foi ${formatCurrency(grossRevenue?.current_value ?? 0)}; não há comparação válida disponível.`
              : `${formatCurrency(grossRevenue?.current_value ?? 0)} em receita consolidada, comparada ao período equivalente anterior.`,
          metricLabel: 'Variação da Receita',
          metricValue: grossRevenue?.percentage_delta == null ? 'Indisponível' : formatDelta(grossRevenue.percentage_delta),
          dimension: 'monetary',
          favorable: grossRevenue?.is_favorable,
        },
        {
          id: 'funnel-health',
          coordinate: 'SIG.02',
          finding: 'Leitura estável do funil de conversão',
          evidence: `${data.funnel[0]?.count?.toLocaleString('en-US') ?? 0} sessões ativas sustentam a taxa calculada para a janela selecionada.`,
          metricLabel: 'Taxa de Conversão',
          metricValue: formatPercentage(conversion?.current_value ?? 0),
          dimension: 'behavioral',
          favorable: conversion?.is_favorable,
        },
        {
          id: 'category-contribution',
          coordinate: 'SIG.03',
          finding: leadingCategory
            ? `${leadingCategory.name} lidera a contribuição de vendas`
            : 'Contribuição por categoria indisponível',
          evidence: leadingCategory
            ? `${formatCurrency(leadingCategory.revenue)} gerados, correspondendo a ${formatPercentage(leadingCategory.share)} da distribuição total.`
            : 'Não há categorias retornadas para a janela selecionada.',
          metricLabel: 'Participação Líder',
          metricValue: leadingCategory ? formatPercentage(leadingCategory.share) : 'Indisponível',
          dimension: 'structural',
        },
      ]
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* 01 — EXECUTIVE HERO */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <AnalyticalCoordinate dimension="monetary">EXECUTIVE OVERVIEW · LIVE TELEMETRY</AnalyticalCoordinate>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 prism-live-dot" />
              SYNCHRONIZED
            </span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-tight">
            Visão Geral Executiva
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-500">
            Leitura holística do desempenho comercial, refratada em contexto de receita, instrumentos de conversão e evidências operacionais.
          </p>
        </div>

        {/* Secondary Context & Engine Badges */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs text-xs font-mono">
            <Database className="h-3.5 w-3.5 text-prism-indigo" />
            <span className="text-slate-500">Data Mart:</span>
            <strong className="text-slate-800 font-semibold">100k Rows</strong>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs text-xs font-mono">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-slate-500">Query:</span>
              <strong className="text-slate-800 font-semibold">{formatExecutionTime(data.executionTimeMs)}</strong>
            </div>
          )}
        </div>
      </section>

      {/* 02 — SECONDARY CONTEXT & FILTER BAR */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <DateRangeSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handlePresetChange}
          disabled={isLoading}
        />

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="hidden md:inline font-medium">
            Janela de Comparação: <strong className="text-slate-700 font-semibold">{activeRange.comparisonLabel}</strong>
          </span>
          <button
            type="button"
            onClick={() => void loadDashboardData()}
            disabled={isLoading}
            className="prism-secondary-button"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </section>

      {/* ERROR ALERT */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border-l-4 border-rose-500 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadDashboardData()}
            className="prism-secondary-button border-rose-200 bg-white hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* 03 — MASTER SOURCE + REFRACTION SURFACE */}
      <SourceRefraction
        grossRevenue={grossRevenue}
        orders={orders}
        conversion={conversion}
        averageOrderValue={averageOrderValue}
        trend={data?.trend ?? []}
        periodLabel={activeRange.label}
        comparisonLabel={activeRange.comparisonLabel}
        isLoading={isLoading}
      />

      {/* 04 — EDITORIAL INTELLIGENCE BRIEF */}
      {!isLoading && <IntelligenceBrief signals={signals} />}

      {/* 05 — OPERATIONAL EVIDENCE FIELD */}
      <section className="space-y-4" aria-labelledby="evidence-heading">
        <div className="flex items-center justify-between">
          <div>
            <AnalyticalCoordinate dimension="structural">EVD.01 · OPERATIONAL EVIDENCE FIELD</AnalyticalCoordinate>
            <h2
              id="evidence-heading"
              className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900"
            >
              Evidência Operacional e Estrutura
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400 hidden sm:inline">
            Reconciliado via DuckDB AST
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="prism-panel-master overflow-hidden xl:col-span-2">
            <RevenueTrendCard
              data={data?.trend ?? []}
              timeGrain={timeGrain}
              onTimeGrainChange={setTimeGrain}
              isLoading={isLoading}
            />
          </div>
          <div className="prism-panel-master overflow-hidden">
            <CategoryBreakdownCard
              data={data?.categories ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </div>
  );
};


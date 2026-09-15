'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Clock, Database, RefreshCw, Zap, Bell, Sparkles } from 'lucide-react';
import { DateRangePreset, DATE_PRESETS, DateRangeSelector } from './DateRangeSelector';
import { RevenueTrendCard } from './RevenueTrendCard';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { SourceRefraction } from './SourceRefraction';
import { IntelligenceBrief, IntelligenceSignal } from './IntelligenceBrief';
import { ConversionFunnelCard } from './ConversionFunnelCard';
import { ExecutiveExportModal } from './ExecutiveExportModal';
import { AlarmRulesModal } from './AlarmRulesModal';
import { ExecutiveAudioPlayer } from './ExecutiveAudioPlayer';
import { LiveStreamTicker } from './LiveStreamTicker';
import { MetricDrilldownModal } from './MetricDrilldownModal';
import { GoalsThermometer } from './GoalsThermometer';
import { WhatIfSimulator } from './WhatIfSimulator';
import { BoardroomModeModal } from './BoardroomModeModal';
import { BrazilGeoHeatmap } from './BrazilGeoHeatmap';
import { AnomalyDetectionRadar } from './AnomalyDetectionRadar';
import { SlaHealthCockpit } from './SlaHealthCockpit';
import { ExecutiveDossierGenerator } from './ExecutiveDossierGenerator';
import { VoiceStudioModal } from './VoiceStudioModal';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { TimeGrain, MetricSummaryValue } from '@/lib/contracts/analytics';
import { fetchOverviewDashboardData, OverviewDashboardData, prewarmOverviewCache } from '@/lib/api/analytics';
import { formatCurrency, formatDelta, formatExecutionTime, formatPercentage } from '@/lib/utils/formatters';
import { soundEffects } from '@/lib/utils/soundEffects';
import { Tv, Mic, FileText } from 'lucide-react';

export const OverviewDashboardClient: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [timeGrain, setTimeGrain] = useState<TimeGrain>('day');
  const [data, setData] = useState<OverviewDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isBoardroomOpen, setIsBoardroomOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);

  // Drilldown state
  const [drilldownMetric, setDrilldownMetric] = useState<{
    key: string;
    label: string;
    data: MetricSummaryValue;
  } | null>(null);

  const activeRange = DATE_PRESETS[selectedPreset];

  // 1. Initial Load & Background Warmup of all presets for 0ms transitions
  useEffect(() => {
    prewarmOverviewCache(
      Object.values(DATE_PRESETS).map((p) => ({
        startDate: p.startDate,
        endDate: p.endDate,
      }))
    );
  }, []);

  const loadDashboardData = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchOverviewDashboardData(activeRange.startDate, activeRange.endDate, timeGrain, force));
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
    <div className="space-y-6 pb-16">
      {/* 00 — REAL-TIME TRANSACTION STREAM TICKER */}
      <LiveStreamTicker />

      {/* 01 — EXECUTIVE HERO */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <AnalyticalCoordinate dimension="monetary">EXECUTIVE OVERVIEW · LIVE TELEMETRY</AnalyticalCoordinate>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYNCHRONIZED (0ms CACHE)
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs text-xs font-mono">
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-slate-500">Data Mart:</span>
            <strong className="text-slate-800 font-semibold">100k Rows</strong>
          </div>
          {data && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs text-xs font-mono">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-500">Query:</span>
              <strong className="text-slate-800 font-semibold">{formatExecutionTime(data.executionTimeMs)}</strong>
            </div>
          )}
        </div>
      </section>

      {/* 02 — SECONDARY CONTEXT & FILTER BAR */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <DateRangeSelector
          selectedPreset={selectedPreset}
          onSelectPreset={handlePresetChange}
          disabled={isLoading}
        />

        <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
          <span className="hidden xl:inline font-medium">
            Janela: <strong className="text-slate-700 font-semibold">{activeRange.comparisonLabel}</strong>
          </span>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsVoiceStudioOpen(true);
            }}
            className="prism-secondary-button text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            title="Abrir Assistente de Voz Neural PRISM"
          >
            <Mic className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold">Voz IA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playBoardroomActivate();
              setIsBoardroomOpen(true);
            }}
            disabled={isLoading || !data}
            className="prism-secondary-button text-xs bg-slate-900 text-white hover:bg-slate-800 border-slate-700 shadow-xs"
            title="Abrir Modo Apresentação / Painel de TV Executivo"
          >
            <Tv className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold">Modo TV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsDossierOpen(true);
            }}
            disabled={isLoading || !data}
            className="prism-secondary-button text-xs"
            title="Gerar Dossiê Oficial e Imprimir PDF"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Dossiê PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsAlarmModalOpen(true);
            }}
            className="prism-secondary-button text-xs"
            title="Configurar Alarmes e Salvaguardas CloudWatch"
          >
            <Bell className="h-3.5 w-3.5 text-amber-500" />
            <span>Alarmes</span>
          </button>

          <button
            type="button"
            onClick={() => void loadDashboardData(true)}
            disabled={isLoading}
            className="prism-secondary-button text-xs"
            title="Forçar atualização dos dados"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>
        </div>
      </section>

      {/* 03 — AI EXECUTIVE AUDIO PLAYER WITH EQUALIZER */}
      <ExecutiveAudioPlayer data={data} periodLabel={activeRange.label} />

      {/* 03.1 — GOALS & OKRS THERMOMETER */}
      <GoalsThermometer
        currentRevenue={grossRevenue?.current_value}
        periodLabel={activeRange.label}
      />

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
            onClick={() => void loadDashboardData(true)}
            className="prism-secondary-button border-rose-200 bg-white hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* 04 — MASTER SOURCE + REFRACTION SURFACE */}
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

      {/* 04.1 — WHAT-IF FORECASTING SIMULATOR */}
      <WhatIfSimulator
        baseRevenue={grossRevenue?.current_value}
        baseConversion={conversion?.current_value}
        baseAov={averageOrderValue?.current_value}
        baseOrders={orders?.current_value}
      />

      {/* 04.2 — REAL-TIME STATISTICAL ANOMALY DETECTION RADAR */}
      <AnomalyDetectionRadar />

      {/* 05 — EDITORIAL INTELLIGENCE BRIEF */}
      {!isLoading && <IntelligenceBrief signals={signals} />}

      {/* 06 — BRAZILIAN GEOGRAPHIC RADAR & HEATMAP */}
      <BrazilGeoHeatmap />

      {/* 07 — OPERATIONAL EVIDENCE FIELD */}
      <section className="space-y-6" aria-labelledby="evidence-heading">
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

        {/* 5-Stage Behavioral Conversion Funnel */}
        <ConversionFunnelCard
          data={data?.funnel ?? []}
          isLoading={isLoading}
        />
      </section>

      {/* 08 — HIGH RESILIENCE SLA & HEALTH COCKPIT */}
      <SlaHealthCockpit />

      {/* Executive Report & Export Modal */}
      <ExecutiveExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        periodLabel={activeRange.label}
      />

      {/* Official 1-Click Dossier Generator Modal */}
      <ExecutiveDossierGenerator
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        data={data}
        periodLabel={activeRange.label}
      />

      {/* PRISM Voice Studio Modal */}
      <VoiceStudioModal
        isOpen={isVoiceStudioOpen}
        onClose={() => setIsVoiceStudioOpen(false)}
        data={data}
      />

      {/* CloudWatch Alarms Modal */}
      <AlarmRulesModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
      />

      {/* Boardroom TV Mode Modal */}
      <BoardroomModeModal
        isOpen={isBoardroomOpen}
        onClose={() => setIsBoardroomOpen(false)}
        data={data}
      />

      {/* Metric Root-Cause Drilldown Modal */}
      {drilldownMetric && (
        <MetricDrilldownModal
          isOpen={!!drilldownMetric}
          onClose={() => setDrilldownMetric(null)}
          metricKey={drilldownMetric.key}
          metricLabel={drilldownMetric.label}
          metricData={drilldownMetric.data}
        />
      )}
    </div>
  );
};

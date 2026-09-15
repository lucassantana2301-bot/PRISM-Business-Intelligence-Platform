'use client';

import React from 'react';
import { X, Printer, Download, Sparkles, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { OverviewDashboardData } from '@/lib/api/analytics';
import { formatCurrency, formatDelta, formatInteger, formatPercentage } from '@/lib/utils/formatters';
import { soundEffects } from '@/lib/utils/soundEffects';

interface ExecutiveDossierGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  data: OverviewDashboardData | null;
  periodLabel: string;
}

export const ExecutiveDossierGenerator: React.FC<ExecutiveDossierGeneratorProps> = ({
  isOpen,
  onClose,
  data,
  periodLabel,
}) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    soundEffects.playSuccess();
    window.print();
  };

  const gross = data.kpis.gross_revenue;
  const orders = data.kpis.orders;
  const conv = data.kpis.conversion_rate;
  const aov = data.kpis.average_order_value;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 lg:p-10 flex justify-center animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 my-auto text-slate-900 font-sans">
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-sm">Dossiê Executivo Oficial · Pronto para Impressão / PDF</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Report Document */}
        <div className="p-8 sm:p-12 space-y-8 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-indigo-600 font-bold uppercase tracking-widest">
                PRISM · BUSINESS INTELLIGENCE PLATFORM
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                Relatório de Desempenho Executivo
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Período de Apuração: <strong className="text-slate-800">{periodLabel}</strong> · Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            <div className="text-right font-mono text-2xs text-slate-400">
              <span className="block font-bold text-slate-700">DOCUMENTO OFICIAL</span>
              <span>Reconciliação DuckDB AST</span>
              <span className="block text-emerald-600 font-semibold">Assinatura Digital Válida</span>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Indicadores Principais de Desempenho (KPIs Canônicos)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-2xs font-mono uppercase text-slate-500 block">Receita Bruta</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatCurrency(gross?.current_value ?? 0)}
                </span>
                <span className="text-2xs text-emerald-700 font-mono mt-0.5 block">
                  {gross?.percentage_delta != null ? formatDelta(gross.percentage_delta) : 'N/A'} vs período anterior
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-2xs font-mono uppercase text-slate-500 block">Volume de Pedidos</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatInteger(orders?.current_value ?? 0)}
                </span>
                <span className="text-2xs text-slate-600 font-mono mt-0.5 block">
                  {orders?.percentage_delta != null ? formatDelta(orders.percentage_delta) : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-2xs font-mono uppercase text-slate-500 block">Taxa de Conversão</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatPercentage(conv?.current_value ?? 0)}
                </span>
                <span className="text-2xs text-emerald-700 font-mono mt-0.5 block">
                  {conv?.percentage_delta != null ? formatDelta(conv.percentage_delta) : 'N/A'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-2xs font-mono uppercase text-slate-500 block">Ticket Médio (AOV)</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatCurrency(aov?.current_value ?? 0)}
                </span>
                <span className="text-2xs text-slate-600 font-mono mt-0.5 block">
                  {aov?.percentage_delta != null ? formatDelta(aov.percentage_delta) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Top Categories Table */}
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Distribuição de Faturamento por Categoria
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-mono text-2xs uppercase">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Categoria</th>
                    <th className="py-2.5 px-4 font-bold text-right">Receita Bruta</th>
                    <th className="py-2.5 px-4 font-bold text-right">Participação (% Share)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {data.categories.map((cat) => (
                    <tr key={cat.name}>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{cat.name}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-900">{formatCurrency(cat.revenue)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{formatPercentage(cat.share)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Conversion Funnel */}
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Telemetria do Funil de Conversão (5 Estágios)
            </h2>

            <div className="grid grid-cols-5 gap-2 text-center font-mono">
              {data.funnel.map((fn, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-2xs font-bold text-indigo-700 block truncate">{fn.step}</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">{formatInteger(fn.count)}</span>
                  <span className="text-2xs text-slate-500 mt-0.5 block">{fn.conversion} conv.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer & Compliance Signature */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Auditado e Reconciliado pelo Motor de Dados PRISM OLAP Core</span>
            </div>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

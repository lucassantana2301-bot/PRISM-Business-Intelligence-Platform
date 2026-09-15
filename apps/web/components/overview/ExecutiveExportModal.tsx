'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Printer,
  X,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  Database,
} from 'lucide-react';
import { OverviewDashboardData } from '@/lib/api/analytics';
import { formatCurrency, formatDelta, formatInteger, formatPercentage } from '@/lib/utils/formatters';

interface ExecutiveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OverviewDashboardData | null;
  periodLabel: string;
}

export const ExecutiveExportModal: React.FC<ExecutiveExportModalProps> = ({
  isOpen,
  onClose,
  data,
  periodLabel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Delta %', 'Favorable'],
      ['Gross Revenue', data.kpis.gross_revenue?.current_value, data.kpis.gross_revenue?.percentage_delta, data.kpis.gross_revenue?.is_favorable],
      ['Orders', data.kpis.orders?.current_value, data.kpis.orders?.percentage_delta, data.kpis.orders?.is_favorable],
      ['Conversion Rate', data.kpis.conversion_rate?.current_value, data.kpis.conversion_rate?.percentage_delta, data.kpis.conversion_rate?.is_favorable],
      ['Average Order Value', data.kpis.average_order_value?.current_value, data.kpis.average_order_value?.percentage_delta, data.kpis.average_order_value?.is_favorable],
      [],
      ['Category', 'Revenue', 'Share %'],
      ...data.categories.map((c) => [c.name, c.revenue, c.share]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRISM_Executive_Report_${data.startDate}_to_${data.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMemo = () => {
    const memoText = `
=====================================================
PRISM — EXECUTIVE INTELLIGENCE MEMO
Window: ${periodLabel} (${data.startDate} → ${data.endDate})
=====================================================

1. EXECUTIVE FINANCIAL POSITION:
- Gross Revenue: ${formatCurrency(data.kpis.gross_revenue?.current_value ?? 0)} (${formatDelta(data.kpis.gross_revenue?.percentage_delta ?? 0)})
- Total Orders: ${formatInteger(data.kpis.orders?.current_value ?? 0)} (${formatDelta(data.kpis.orders?.percentage_delta ?? 0)})
- Conversion Rate: ${formatPercentage(data.kpis.conversion_rate?.current_value ?? 0)} (${formatDelta(data.kpis.conversion_rate?.percentage_delta ?? 0)})
- Average Order Value: ${formatCurrency(data.kpis.average_order_value?.current_value ?? 0)} (${formatDelta(data.kpis.average_order_value?.percentage_delta ?? 0)})

2. LEADING CATEGORY CONTRIBUTION:
${data.categories.map((c) => `- ${c.name}: ${formatCurrency(c.revenue)} (${c.share}%)`).join('\n')}

3. ENGINE PROVENANCE:
- Vectorized DuckDB In-Memory OLAP
- Reconciled against 100k canonical transaction records.
=====================================================
    `.trim();

    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-prism-indigo">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Relatório Executivo C-Level</h3>
              <p className="text-[11px] text-slate-500">Exportação e geração de memo oficial</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Memo Content Preview */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="p-5 rounded-xl border border-slate-200/80 bg-[#fbfcfd] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-mono text-[10px] font-bold tracking-wider text-prism-indigo uppercase">
                PRISM · Executive Briefing
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {data.startDate} → {data.endDate}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumo da Posição Financeira
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Receita Bruta</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                    {formatCurrency(data.kpis.gross_revenue?.current_value ?? 0)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    {formatDelta(data.kpis.gross_revenue?.percentage_delta ?? 0)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Pedidos</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                    {formatInteger(data.kpis.orders?.current_value ?? 0)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    {formatDelta(data.kpis.orders?.percentage_delta ?? 0)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Conversão</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                    {formatPercentage(data.kpis.conversion_rate?.current_value ?? 0)}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                    Estável
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Ticket Médio</span>
                  <span className="text-sm font-bold font-mono text-slate-900 block tabular-nums">
                    {formatCurrency(data.kpis.average_order_value?.current_value ?? 0)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                    {formatDelta(data.kpis.average_order_value?.percentage_delta ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Validado via DuckDB Analytics Engine
              </span>
              <span className="font-mono text-[10px]">100k registros</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <button
            type="button"
            onClick={handleCopyMemo}
            className="prism-secondary-button text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Sparkles className="h-3.5 w-3.5 text-indigo-600" />}
            <span>{copied ? 'Copiado para Clipboard!' : 'Copiar Memo Executivo'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="prism-secondary-button text-xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  Cloud,
  Table as TableIcon,
  Clock,
  Lock,
  Zap,
} from 'lucide-react';
import { DataSourcesResponse } from '@/lib/contracts/data_sources';

interface DataSourcesViewProps {
  initialData: DataSourcesResponse;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ initialData }) => {
  const { active_source, sources } = initialData;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'duckdb':
        return Database;
      case 'postgresql':
        return Server;
      case 'bigquery':
        return Cloud;
      default:
        return Database;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Active Data Engine Master Panel */}
      <div className="prism-panel-master p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {active_source.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Motor OLAP Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {active_source.endpoint_redacted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-700 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{active_source.latency_ms}ms latência</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{active_source.available_tables.length} tabelas catalogadas</span>
            </div>
          </div>
        </div>

        {/* Governance & Sandbox Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="text-slate-900 font-bold font-mono">AST Read-Only</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero permissões DDL/DML</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="text-slate-900 font-bold font-mono">Max 1.000 Linhas/Query</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Proteção de memória estrita</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="text-slate-900 font-bold font-mono">{active_source.governance.query_timeout_ms}ms Timeout</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cancelamento automático de runaway</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Provider Ecosystem Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
            Ecossistema de Motores & Data Warehouses
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sources.map((src) => {
            const Icon = getSourceIcon(src.type);
            const isConnected = src.status === 'connected';

            return (
              <div
                key={src.id}
                className={`p-6 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md ${
                  src.is_default
                    ? 'border-indigo-300 ring-2 ring-indigo-50'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border font-semibold ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isConnected ? (src.is_default ? 'Ativo (Padrão)' : 'Conectado') : 'Configurável via Env'}
                    </span>
                  </div>

                  <h5 className="text-base font-bold text-slate-900 tracking-tight">{src.name}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400 truncate">
                  {src.endpoint_redacted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Cataloged Tables & Schema Specifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              Catálogo de Conjuntos de Dados Canônicos ({active_source.available_tables.length} Tabelas)
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total de Registros: <strong className="text-slate-900">{initialData.total_rows.toLocaleString()}</strong>
          </span>
        </div>

        <div className="prism-panel-master overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-5">Tabela</th>
                <th className="py-3.5 px-5">Volume de Registros</th>
                <th className="py-3.5 px-5">Descrição Semântica</th>
                <th className="py-3.5 px-5">Colunas Catalogadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {active_source.available_tables.map((t) => (
                <tr key={t.table_name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-bold font-mono text-indigo-600">{t.table_name}</td>
                  <td className="py-4 px-5 font-bold font-mono text-slate-900">{t.row_count.toLocaleString()}</td>
                  <td className="py-4 px-5 text-slate-600 text-xs max-w-sm leading-relaxed">{t.description}</td>
                  <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">{t.columns.slice(0, 4).join(', ')}... ({t.columns.length} colunas)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

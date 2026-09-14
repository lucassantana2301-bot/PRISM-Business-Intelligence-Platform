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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Active Data Engine Card */}
      <div className="p-5 rounded-xl bg-prism-bg-card border border-prism-border-subtle shadow-prism-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-prism-border-subtle/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-prism-accent-blue/10 border border-prism-accent-blue/30 text-prism-accent-blue shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-prism-text-primary tracking-tight">
                  {active_source.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Active OLAP Engine
                </span>
              </div>
              <p className="text-xs text-prism-text-muted mt-0.5 font-mono">
                {active_source.endpoint_redacted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-prism-text-muted px-2.5 py-1 rounded-lg bg-prism-bg-base border border-prism-border-subtle">
              <Clock className="w-3.5 h-3.5 text-prism-accent-blue" />
              <span>{active_source.latency_ms}ms latency</span>
            </div>
            <div className="flex items-center gap-1.5 text-prism-text-muted px-2.5 py-1 rounded-lg bg-prism-bg-base border border-prism-border-subtle">
              <TableIcon className="w-3.5 h-3.5 text-prism-accent-purple" />
              <span>{active_source.available_tables.length} tables cataloged</span>
            </div>
          </div>
        </div>

        {/* Governance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-prism-bg-base/80 border border-prism-border-subtle flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-prism-text-primary font-medium">AST Read-Only</div>
              <div className="text-[10px] text-prism-text-muted">Zero DDL/DML permissions</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-prism-bg-base/80 border border-prism-border-subtle flex items-center gap-3">
            <Lock className="w-4 h-4 text-prism-accent-blue flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-prism-text-primary font-medium">Max 1,000 Rows/Query</div>
              <div className="text-[10px] text-prism-text-muted">Strict memory protection</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-prism-bg-base/80 border border-prism-border-subtle flex items-center gap-3">
            <Clock className="w-4 h-4 text-prism-accent-purple flex-shrink-0" />
            <div className="text-xs font-mono">
              <div className="text-prism-text-primary font-medium">{active_source.governance.query_timeout_ms}ms Timeout</div>
              <div className="text-[10px] text-prism-text-muted">Auto-kill runaway queries</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Provider Ecosystem Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-prism-text-muted font-medium">
          Supported Analytical Engines & Warehouses
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((src) => {
            const Icon = getSourceIcon(src.type);
            const isConnected = src.status === 'connected';

            return (
              <div
                key={src.id}
                className={`p-5 rounded-xl bg-prism-bg-card border transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-prism-card hover:shadow-prism-elevated ${
                  src.is_default
                    ? 'border-prism-accent-blue/50 ring-1 ring-prism-accent-blue/20'
                    : 'border-prism-border-subtle hover:border-prism-border-hover'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-prism-bg-base border border-prism-border-subtle text-prism-accent-blue">
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono border font-medium ${
                        isConnected
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {isConnected ? (src.is_default ? 'Active Demo' : 'Connected') : 'Available via Env'}
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-prism-text-primary tracking-tight">{src.name}</h5>
                  <p className="text-xs text-prism-text-secondary leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-prism-border-subtle/50 text-[11px] font-mono text-prism-text-muted truncate">
                  {src.endpoint_redacted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Cataloged Tables & Schema Specifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-prism-text-muted font-medium">
            Allowlisted Dataset Catalog ({active_source.available_tables.length} Tables)
          </h4>
          <span className="text-xs font-mono text-prism-text-muted">
            Total Rows: {initialData.total_rows.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-prism-border-subtle overflow-hidden bg-prism-bg-card shadow-prism-card">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-prism-bg-elevated/80 border-b border-prism-border-subtle text-[10px] text-prism-text-muted uppercase">
                <th className="py-3 px-4 font-semibold">Table</th>
                <th className="py-3 px-4 font-semibold">Record Count</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Allowlisted Columns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prism-border-subtle/40">
              {active_source.available_tables.map((t) => (
                <tr key={t.table_name} className="hover:bg-prism-bg-elevated/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-prism-accent-blue">{t.table_name}</td>
                  <td className="py-3.5 px-4 text-prism-text-primary">{t.row_count.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-prism-text-secondary max-w-xs">{t.description}</td>
                  <td className="py-3.5 px-4 text-prism-text-muted text-[10px]">{t.columns.slice(0, 4).join(', ')}... ({t.columns.length} total)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

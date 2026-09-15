'use client';

import React from 'react';
import { Activity, Server, ShieldCheck, Zap, HardDrive, Wifi, CheckCircle2, Clock } from 'lucide-react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { soundEffects } from '@/lib/utils/soundEffects';

interface MicroserviceStatus {
  name: string;
  type: string;
  uptime: string;
  latency: string;
  status: 'operational' | 'degraded' | 'maintenance';
}

const SERVICES: MicroserviceStatus[] = [
  { name: 'DuckDB In-Memory OLAP Cluster', type: 'Analytical Engine', uptime: '99.999%', latency: '18ms (p95)', status: 'operational' },
  { name: 'Pix Instant Settlement Webhook', type: 'Payment Gateway', uptime: '100.000%', latency: '120ms (p95)', status: 'operational' },
  { name: 'Credit Card Tokenizer & Anti-Fraud', type: 'Security Engine', uptime: '99.984%', latency: '340ms (p95)', status: 'operational' },
  { name: 'AWS S3 Parquet Data Lake', type: 'Object Storage', uptime: '100.000%', latency: '45ms (p95)', status: 'operational' },
];

export const SlaHealthCockpit: React.FC = () => {
  return (
    <div className="prism-panel-master p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <AnalyticalCoordinate dimension="structural">
            INFRA.01 · HIGH-RESILIENCE SLA & ENGINE HEALTH
          </AnalyticalCoordinate>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-600" />
            Cockpit de Resiliência & SLAs de Infraestrutura
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Monitoramento de disponibilidade contratual (99.99% SLO) e telemetria de latência nos clusters DuckDB e Gateways
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Todos os Sistemas Operacionais</span>
        </div>
      </div>

      {/* 4 Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between text-2xs font-mono uppercase text-slate-400">
            <span>Disponibilidade SLA</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">99.994%</div>
          <span className="text-2xs text-emerald-600 font-mono mt-0.5 block">
            Error Budget restante: 88.4%
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between text-2xs font-mono uppercase text-slate-400">
            <span>Latência DuckDB p99</span>
            <Zap className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">64.2 ms</div>
          <span className="text-2xs text-slate-500 font-mono mt-0.5 block">
            Média p50: 12.8 ms
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between text-2xs font-mono uppercase text-slate-400">
            <span>Throughput de Consultas</span>
            <Server className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">1.480 qps</div>
          <span className="text-2xs text-slate-500 font-mono mt-0.5 block">
            0 requisições rejeitadas
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50">
          <div className="flex items-center justify-between text-2xs font-mono uppercase text-slate-400">
            <span>Memória do Cluster</span>
            <HardDrive className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">1.42 / 8 GB</div>
          <span className="text-2xs text-emerald-600 font-mono mt-0.5 block">
            17.7% de utilização (Seguro)
          </span>
        </div>
      </div>

      {/* Microservice Health List */}
      <div className="rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 text-2xs font-mono uppercase font-bold text-slate-600 flex justify-between">
          <span>Serviço / Microserviço</span>
          <div className="flex gap-12 mr-4">
            <span>Disponibilidade</span>
            <span>Latência p95</span>
            <span>Status</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 bg-white font-mono text-xs">
          {SERVICES.map((srv) => (
            <div key={srv.name} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60">
              <div>
                <span className="font-sans font-semibold text-slate-900 text-sm block">{srv.name}</span>
                <span className="text-2xs text-slate-400 font-mono">{srv.type}</span>
              </div>

              <div className="flex items-center gap-10">
                <span className="text-slate-700 font-medium">{srv.uptime}</span>
                <span className="text-slate-500">{srv.latency}</span>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operacional
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

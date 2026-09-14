'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Table as TableIcon,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VisualizationSpec } from '@/lib/contracts/visualization';
import { formatCurrency, formatPercentage, formatInteger, formatDelta } from '@/lib/utils/formatters';

interface VisualizationRendererProps {
  spec: VisualizationSpec;
  className?: string;
  showExplanation?: boolean;
}

const PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];

export const VisualizationRenderer: React.FC<VisualizationRendererProps> = ({
  spec,
  className = '',
  showExplanation = true,
}) => {
  const [showExplanationDetail, setShowExplanationDetail] = useState(false);

  if (!spec) return null;

  const formatValue = (val: any) => {
    if (typeof val !== 'number') return String(val ?? '—');
    if (spec.format_type === 'percentage') return formatPercentage(val);
    if (spec.format_type === 'integer') return formatInteger(val);
    if (spec.format_type === 'currency' || (val > 100 && spec.format_type !== 'ratio')) return formatCurrency(val);
    return val.toLocaleString();
  };

  const renderHeader = (Icon: React.ElementType) => (
    <div className="flex items-center justify-between pb-2 border-b border-prism-border-subtle/40 mb-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-prism-text-primary">{spec.title}</span>
          {spec.subtitle && (
            <span className="text-[11px] text-prism-text-muted">({spec.subtitle})</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showExplanation && spec.explanation && (
          <button
            type="button"
            onClick={() => setShowExplanationDetail(!showExplanationDetail)}
            className="flex items-center gap-1 text-[10px] font-mono text-prism-text-muted hover:text-prism-accent-blue transition-colors px-1.5 py-0.5 rounded bg-prism-bg-card border border-prism-border-subtle"
            title="Explain why PRISM selected this visualization"
          >
            <Info className="w-3 h-3" />
            <span>Provenance</span>
            {showExplanationDetail ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </button>
        )}
        <div className="p-1 rounded bg-prism-bg-card border border-prism-border-subtle text-prism-accent-blue">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );

  const renderExplanationDrawer = () => {
    if (!showExplanationDetail || !spec.explanation) return null;
    return (
      <div className="mb-3 p-2.5 rounded bg-prism-bg-card/90 border border-prism-border-subtle text-[11px] font-mono text-prism-text-secondary flex items-start gap-2 animate-in fade-in">
        <Sparkles className="w-3.5 h-3.5 text-prism-accent-blue flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-prism-text-primary">Decision Provenance:</strong> {spec.explanation}
        </div>
      </div>
    );
  };

  // 1. Single Metric Card
  if (spec.type === 'metric') {
    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card max-w-sm space-y-2.5 ${className}`}>
        {renderHeader(Sparkles)}
        {renderExplanationDrawer()}
        <div className="text-3xl font-bold font-mono text-prism-text-primary tracking-tight">
          {spec.metric_value}
        </div>
        {spec.delta !== null && spec.delta !== undefined && (
          <div className="flex items-center gap-2 text-xs font-mono pt-1">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
                spec.is_favorable ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
              }`}
            >
              {formatDelta(spec.delta)}
            </span>
            {spec.comparison_label && (
              <span className="text-prism-text-muted text-[11px]">{spec.comparison_label}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Bar Chart (Vertical)
  if (spec.type === 'bar' && spec.series && spec.series.length > 0) {
    const xKey = spec.x_axis || spec.dimension || 'name';
    const yKey = spec.y_axis || spec.metric || 'value';

    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card space-y-3 ${className}`}>
        {renderHeader(BarChart3)}
        {renderExplanationDrawer()}
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spec.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
              <XAxis dataKey={xKey} stroke="#8A99AD" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#8A99AD"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => typeof v === 'number' && v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `${v}`}
              />
              <Tooltip
                formatter={(val: any) => [formatValue(val), yKey]}
                contentStyle={{ backgroundColor: 'rgba(17, 19, 26, 0.95)', borderColor: '#363D4F', borderRadius: '10px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <Bar dataKey={yKey} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 3. Horizontal Bar Chart (Rankings)
  if (spec.type === 'horizontal_bar' && spec.series && spec.series.length > 0) {
    const xKey = spec.y_axis || spec.metric || 'value';
    const yKey = spec.x_axis || spec.dimension || 'name';

    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card space-y-3 ${className}`}>
        {renderHeader(BarChart3)}
        {renderExplanationDrawer()}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spec.series} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" horizontal={false} />
              <XAxis
                type="number"
                stroke="#8A99AD"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => typeof v === 'number' && v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `${v}`}
              />
              <YAxis type="category" dataKey={yKey} stroke="#8A99AD" fontSize={10} tickLine={false} width={80} />
              <Tooltip
                formatter={(val: any) => [formatValue(val), xKey]}
                contentStyle={{ backgroundColor: 'rgba(17, 19, 26, 0.95)', borderColor: '#363D4F', borderRadius: '10px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <Bar dataKey={xKey} fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 4. Area Chart (Volume / Revenue Trajectories)
  if (spec.type === 'area' && spec.series && spec.series.length > 0) {
    const xKey = spec.x_axis || 'timestamp';
    const yKey = spec.y_axis || 'net_revenue';

    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card space-y-3 ${className}`}>
        {renderHeader(TrendingUp)}
        {renderExplanationDrawer()}
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spec.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
              <XAxis dataKey={xKey} stroke="#8A99AD" fontSize={10} tickLine={false} tickFormatter={(d) => String(d).substring(5)} />
              <YAxis
                stroke="#8A99AD"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => typeof v === 'number' && v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `${v}`}
              />
              <Tooltip
                formatter={(val: any) => [formatValue(val), yKey]}
                contentStyle={{ backgroundColor: 'rgba(17, 19, 26, 0.95)', borderColor: '#363D4F', borderRadius: '10px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <Area type="monotone" dataKey={yKey} stroke="#3B82F6" fill="url(#colorArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 5. Line Chart (Rates / Ratios Trajectories)
  if (spec.type === 'line' && spec.series && spec.series.length > 0) {
    const xKey = spec.x_axis || 'timestamp';
    const yKey = spec.y_axis || 'value';

    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card space-y-3 ${className}`}>
        {renderHeader(TrendingUp)}
        {renderExplanationDrawer()}
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spec.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
              <XAxis dataKey={xKey} stroke="#8A99AD" fontSize={10} tickLine={false} tickFormatter={(d) => String(d).substring(5)} />
              <YAxis stroke="#8A99AD" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [formatValue(val), yKey]}
                contentStyle={{ backgroundColor: 'rgba(17, 19, 26, 0.95)', borderColor: '#363D4F', borderRadius: '10px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <Line type="monotone" dataKey={yKey} stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 6. Donut Chart (Categorical Distribution / Composition)
  if (spec.type === 'donut' && spec.series && spec.series.length > 0) {
    const nameKey = spec.dimension || spec.x_axis || 'name';
    const valKey = spec.metric || spec.y_axis || 'value';

    return (
      <div className={`p-5 rounded-xl bg-prism-bg-base/90 border border-prism-border-subtle shadow-prism-card space-y-3 ${className}`}>
        {renderHeader(PieIcon)}
        {renderExplanationDrawer()}
        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: any) => [formatValue(val), valKey]}
                contentStyle={{ backgroundColor: 'rgba(17, 19, 26, 0.95)', borderColor: '#363D4F', borderRadius: '10px', fontSize: '11px', color: '#F8FAFC', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', color: '#8A99AD' }} />
              <Pie
                data={spec.series}
                dataKey={valKey}
                nameKey={nameKey}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
              >
                {spec.series.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 7. Table (High Cardinality / Multi-column Data)
  if (spec.type === 'table' && spec.series && spec.series.length > 0) {
    const keys = Object.keys(spec.series[0] || {}).slice(0, 5);
    return (
      <div className={`rounded-xl border border-prism-border-subtle overflow-hidden bg-prism-bg-base/90 shadow-prism-card ${className}`}>
        <div className="p-3.5 border-b border-prism-border-subtle bg-prism-bg-base">
          {renderHeader(TableIcon)}
          {renderExplanationDrawer()}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-prism-bg-elevated/80 border-b border-prism-border-subtle text-[10px] text-prism-text-muted uppercase">
                {keys.map((k) => (
                  <th key={k} className="py-2.5 px-3 font-semibold">{k.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-prism-border-subtle/40 text-xs">
              {spec.series.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-prism-bg-elevated/40 transition-colors">
                  {keys.map((k) => (
                    <td key={k} className="py-2 px-3 text-prism-text-secondary">
                      {typeof row[k] === 'number' ? formatValue(row[k]) : String(row[k] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

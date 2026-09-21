'use client';

import React from 'react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';

export interface CategoryDataRow {
  category: string;
  name: string;
  revenue: number;
  gross_revenue: number;
  share: number;
  color?: string;
}

interface CategoryBreakdownCardProps {
  data: CategoryDataRow[];
  isLoading?: boolean;
}

const RANK_OPACITY = [1, 0.8, 0.65, 0.5, 0.35];

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-white via-white to-slate-50/50">
      <div className="mb-6">
        <AnalyticalCoordinate dimension="structural">EVD.03 · STRUCTURE</AnalyticalCoordinate>
        <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
          Receita por Categoria
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribuição canônica da receita bruta entre os departamentos
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-around min-h-[240px]">
        {isLoading ? (
          <div className="space-y-4 animate-shimmer">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                <div className="h-2.5 w-full bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Nenhuma receita de categoria no período
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((cat, idx) => (
              <div key={cat.category || idx} className="space-y-1.5 group hover-lift p-2 rounded-xl transition-all duration-200 hover:bg-slate-50/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-mono text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-semibold truncate group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] shrink-0">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cat.revenue)}
                    </span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                      {formatPercentage(cat.share)}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-500 ease-out shadow-xs"
                    style={{
                      width: `${Math.min(cat.share, 100)}%`,
                      opacity: RANK_OPACITY[idx] ?? 0.4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


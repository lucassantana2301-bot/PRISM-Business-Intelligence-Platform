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
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
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
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded" />
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
              <div key={cat.category || idx} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-semibold truncate group-hover:text-prism-indigo transition-colors">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cat.revenue)}
                    </span>
                    <span className="text-slate-400 font-normal">
                      ({formatPercentage(cat.share)})
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.min(cat.share, 100)}%`,
                      opacity: RANK_OPACITY[idx] ?? RANK_OPACITY[RANK_OPACITY.length - 1],
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


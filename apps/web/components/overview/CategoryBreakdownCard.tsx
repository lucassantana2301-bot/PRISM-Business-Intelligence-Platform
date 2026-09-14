'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';

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

const CATEGORY_COLORS: Record<string, string> = {
  'Electronics': '#2563eb', // blue
  'Eletrônica': '#2563eb',
  'Home & Kitchen': '#0d9488', // teal
  'Casa e Decoração': '#0d9488',
  'Apparel': '#8b5cf6', // purple
  'Roupas e Acessórios': '#8b5cf6',
  'Beauty': '#f59e0b', // amber
  'Beleza e Saúde': '#f59e0b',
  'Sports': '#84cc16', // lime/olive
  'Esporte e Lazer': '#84cc16',
  'Other': '#64748b', // slate
  'Outros': '#64748b',
};

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 font-sans">
          Receita por categoria
        </h3>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          Distribuição canônica da receita bruta entre os departamentos
        </p>
      </div>

      {/* Progress Bars List */}
      <div className="flex-1 flex flex-col justify-around min-h-[240px]">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-sans">
            Nenhuma receita de categoria no período
          </div>
        ) : (
          <div className="space-y-3.5">
            {data.map((cat, idx) => {
              const barColor = cat.color || CATEGORY_COLORS[cat.name] || CATEGORY_COLORS[cat.category] || '#2563eb';
              return (
                <div key={cat.category || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-slate-700 font-semibold truncate">{cat.name}</span>
                    <span className="text-slate-900 font-bold font-sans">
                      US$ {(cat.revenue / 1000).toFixed(1)} mil <span className="text-slate-500 font-normal">({cat.share}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(cat.share, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


'use client';

import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

export interface DataTableShellProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalRows?: number;
  currentPage?: number;
  pageSize?: number;
  tableName?: string;
  onSearchChange?: (val: string) => void;
  onExport?: () => void;
}

export function DataTableShell<T extends object>({
  columns,
  data,
  totalRows,
  currentPage,
  pageSize = 10,
  tableName = 'orders',
  onSearchChange,
  onExport,
}: DataTableShellProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  ), [data, search]);
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => String(a[sortKey as keyof T] ?? '').localeCompare(String(b[sortKey as keyof T] ?? ''), undefined, { numeric: true }) * (sortAscending ? 1 : -1));
  }, [filtered, sortKey, sortAscending]);
  const activePage = currentPage ?? page;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const visible = sorted.slice((activePage - 1) * pageSize, activePage * pageSize);
  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [columns.map((column) => escape(column.header)).join(','), ...sorted.map((row) => columns.map((column) => escape(row[String(column.key) as keyof T])).join(','))];
    const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="rounded-lg bg-prism-bg-card border border-prism-border-subtle overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-prism-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-prism-bg-card">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-prism-text-muted" />
            <input
              type="text"
              placeholder={`Filter in ${tableName}...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); onSearchChange?.(e.target.value); }}
              aria-label={`Filter ${tableName} rows`}
              className="w-full pl-9 pr-3 py-1.5 rounded-md bg-prism-bg-elevated border border-prism-border-subtle text-xs font-mono text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:border-prism-accent-blue transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExport ?? exportCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-prism-bg-elevated border border-prism-border-subtle hover:border-prism-border-hover text-xs font-mono text-prism-text-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-prism-text-muted" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-prism-border-subtle bg-prism-bg-elevated/50 text-[11px] font-mono text-prism-text-muted uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'py-2.5 px-4 font-medium select-none',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                  style={{ width: col.width }}
                >
                  <button type="button" onClick={() => { setSortAscending(sortKey === String(col.key) ? !sortAscending : true); setSortKey(String(col.key)); }} aria-label={`Sort by ${col.header}`} className={clsx(
                    'inline-flex items-center gap-1.5 hover:text-prism-text-primary cursor-pointer transition-colors',
                    col.align === 'right' ? 'justify-end' : ''
                  )}>
                    <span>{col.header}</span>
                    <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-prism-border-subtle/50 font-mono text-xs text-prism-text-primary">
            {visible.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-prism-bg-hover/60 transition-colors group"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={clsx(
                      'py-2.5 px-4 text-prism-text-secondary group-hover:text-prism-text-primary whitespace-nowrap',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-3 border-t border-prism-border-subtle flex items-center justify-between text-xs font-mono text-prism-text-muted bg-prism-bg-card">
        <div>
          Showing <span className="text-prism-text-primary">{sorted.length ? (activePage - 1) * pageSize + 1 : 0}</span> to <span className="text-prism-text-primary">{Math.min(activePage * pageSize, sorted.length)}</span> of <span className="text-prism-text-primary">{(totalRows ?? sorted.length).toLocaleString()}</span> entries
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activePage <= 1}
            onClick={() => setPage((value) => value - 1)}
            aria-label="Previous page"
            className="p-1 rounded bg-prism-bg-elevated border border-prism-border-subtle text-prism-text-secondary disabled:opacity-30 disabled:cursor-not-allowed hover:border-prism-border-hover transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>Page {activePage}</span>
          <button
            type="button"
            disabled={activePage >= pageCount}
            onClick={() => setPage((value) => value + 1)}
            aria-label="Next page"
            className="p-1 rounded bg-prism-bg-elevated border border-prism-border-subtle text-prism-text-secondary hover:border-prism-border-hover transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

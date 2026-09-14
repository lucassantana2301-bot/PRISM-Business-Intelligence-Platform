'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DatasetMetadata,
  ExplorerFilter,
  ExplorerFilterOperator,
  ExplorerQueryResult,
  SortDirection,
  ColumnMetadata,
} from '@/lib/contracts/explorer';
import {
  fetchDatasetList,
  fetchExplorerQuery,
  downloadExplorerCsv,
} from '@/lib/api/explorer_client';
import { formatCurrency, formatInteger, formatPercentage } from '@/lib/utils/formatters';

export const DataExplorerClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // URL state initialization
  const initialDataset = searchParams.get('dataset') || 'orders';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSortBy = searchParams.get('sort_by') || undefined;
  const initialSortDir = (searchParams.get('sort_dir') as SortDirection) || 'desc';

  const [datasets, setDatasets] = useState<(DatasetMetadata & { row_count: number })[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>(initialDataset);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [filters, setFilters] = useState<ExplorerFilter[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDir);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(25);

  const [queryResult, setQueryResult] = useState<ExplorerQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showColumnsModal, setShowColumnsModal] = useState<boolean>(false);
  const [showSchemaDrawer, setShowSchemaDrawer] = useState<boolean>(false);

  // Filter creation form state
  const [newFilterColumn, setNewFilterColumn] = useState<string>('');
  const [newFilterOperator, setNewFilterOperator] = useState<ExplorerFilterOperator>('eq');
  const [newFilterValue, setNewFilterValue] = useState<string>('');

  // 1. Load initial dataset metadata list
  useEffect(() => {
    fetchDatasetList()
      .then((data) => {
        setDatasets(data);
        const currentMeta = data.find((d) => d.dataset_id === selectedDataset);
        if (currentMeta) {
          setVisibleColumns(currentMeta.default_columns);
        }
      })
      .catch((err) => setError(err.message));
  }, [selectedDataset]);

  // 2. Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Current active dataset metadata
  const currentDatasetMeta = datasets.find((d) => d.dataset_id === selectedDataset);

  // 3. Execute Server-Side Query
  const executeQuery = useCallback(async () => {
    if (!selectedDataset) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchExplorerQuery({
        dataset: selectedDataset,
        columns: visibleColumns.length > 0 ? visibleColumns : undefined,
        search: debouncedSearch || undefined,
        filters: filters.length > 0 ? filters : undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page,
        page_size: pageSize,
      });
      setQueryResult(result);
    } catch (err: any) {
      setError(err.message || 'Query failed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDataset, visibleColumns, debouncedSearch, filters, sortBy, sortDirection, page, pageSize]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  // 4. Synchronize URL state
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('dataset', selectedDataset);
    params.set('page', page.toString());
    if (sortBy) {
      params.set('sort_by', sortBy);
      params.set('sort_dir', sortDirection);
    }
    startTransition(() => {
      router.replace(`/explorer?${params.toString()}`, { scroll: false });
    });
  }, [selectedDataset, page, sortBy, sortDirection, router]);

  // Dataset switch handler
  const handleDatasetSwitch = (datasetId: string) => {
    setSelectedDataset(datasetId);
    setSearch('');
    setDebouncedSearch('');
    setFilters([]);
    setSortBy(undefined);
    setSortDirection('desc');
    setPage(1);

    const meta = datasets.find((d) => d.dataset_id === datasetId);
    if (meta) {
      setVisibleColumns(meta.default_columns);
    }
  };

  // Sort click handler
  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortBy(undefined);
        setSortDirection('desc');
      }
    } else {
      setSortBy(columnName);
      setSortDirection('desc');
    }
    setPage(1);
  };

  // Add filter handler
  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterColumn || !newFilterValue.trim()) return;

    let parsedVal: any = newFilterValue.trim();
    const colMeta = currentDatasetMeta?.columns.find((c) => c.name === newFilterColumn);
    if (colMeta?.data_type === 'integer') {
      parsedVal = parseInt(parsedVal, 10) || 0;
    } else if (colMeta?.data_type === 'float') {
      parsedVal = parseFloat(parsedVal) || 0.0;
    } else if (colMeta?.data_type === 'boolean') {
      parsedVal = parsedVal.toLowerCase() === 'true';
    }

    setFilters((prev) => [
      ...prev,
      { column: newFilterColumn, operator: newFilterOperator, value: parsedVal },
    ]);
    setNewFilterValue('');
    setShowFilterModal(false);
    setPage(1);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
    setPage(1);
  };

  // CSV Export Handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExplorerCsv({
        dataset: selectedDataset,
        columns: visibleColumns,
        search: debouncedSearch || undefined,
        filters: filters.length > 0 ? filters : undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
        limit: 5000,
      });
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Cell formatter
  const renderCell = (col: ColumnMetadata, val: any) => {
    if (val === null || val === undefined) return <span className="text-prism-text-muted">—</span>;

    if (col.format_type === 'currency') {
      return <span className="text-prism-text-primary font-mono">{formatCurrency(Number(val))}</span>;
    }
    if (col.format_type === 'integer') {
      return <span className="text-prism-text-secondary font-mono">{formatInteger(Number(val))}</span>;
    }
    if (col.format_type === 'percentage') {
      return <span className="text-prism-accent-blue font-mono">{formatPercentage(Number(val) * 100, 1)}</span>;
    }
    if (col.format_type === 'boolean') {
      return val ? (
        <span className="text-emerald-400 font-mono text-[11px]">● Yes</span>
      ) : (
        <span className="text-prism-text-muted font-mono text-[11px]">○ No</span>
      );
    }
    if (col.format_type === 'badge') {
      let color = 'text-prism-text-secondary';
      if (val === 'Completed' || val === 'VIP') color = 'text-emerald-400';
      if (val === 'Processing' || val === 'Regular') color = 'text-blue-400';
      if (val === 'Cancelled' || val === 'At-Risk') color = 'text-amber-400';
      if (val === 'Churned') color = 'text-rose-400';
      return <span className={`font-mono text-xs ${color}`}>● {val}</span>;
    }
    if (col.format_type === 'datetime') {
      return <span className="text-prism-text-secondary font-mono text-xs">{String(val)}</span>;
    }

    return <span className="text-prism-text-primary text-xs truncate max-w-[200px] inline-block">{String(val)}</span>;
  };

  return (
    <div className="space-y-4">
      {/* 1. Dataset Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-prism-border-subtle/80">
        {datasets.map((d) => {
          const isSelected = selectedDataset === d.dataset_id;
          return (
            <button
              key={d.dataset_id}
              type="button"
              onClick={() => handleDatasetSwitch(d.dataset_id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-prism-bg-card border border-prism-border-strong text-prism-text-primary shadow-sm'
                  : 'text-prism-text-secondary hover:text-prism-text-primary hover:bg-prism-bg-card/40 border border-transparent'
              }`}
            >
              <TableIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-prism-accent-blue' : 'text-prism-text-muted'}`} />
              <span>{d.display_name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-prism-bg-elevated text-prism-text-muted">
                {formatInteger(d.row_count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Exploration Control Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-lg bg-prism-bg-card border border-prism-border-subtle">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prism-text-muted" />
          <input
            type="text"
            placeholder={`Search ${currentDatasetMeta?.display_name || 'records'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-prism-bg-base border border-prism-border-subtle rounded-md text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:border-prism-accent-blue font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Filter Button */}
          <button
            type="button"
            onClick={() => {
              if (currentDatasetMeta && currentDatasetMeta.columns.length > 0) {
                setNewFilterColumn(currentDatasetMeta.columns[0].name);
              }
              setShowFilterModal(true);
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-prism-bg-base border border-prism-border-subtle text-prism-text-secondary hover:text-prism-text-primary hover:border-prism-border-strong flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-prism-accent-blue" />
            <span>Filter</span>
            {filters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-prism-accent-blue text-black font-bold text-[10px] flex items-center justify-center">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Picker Button */}
          <button
            type="button"
            onClick={() => setShowColumnsModal(!showColumnsModal)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-prism-bg-base border border-prism-border-subtle text-prism-text-secondary hover:text-prism-text-primary hover:border-prism-border-strong flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Columns ({visibleColumns.length})</span>
          </button>

          {/* Schema Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowSchemaDrawer(!showSchemaDrawer)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-prism-bg-base border border-prism-border-subtle text-prism-text-secondary hover:text-prism-text-primary hover:border-prism-border-strong flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Schema</span>
          </button>

          {/* CSV Export Button */}
          <button
            type="button"
            disabled={isExporting || isLoading}
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-prism-bg-elevated hover:bg-prism-border-strong border border-prism-border-subtle text-prism-text-primary flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-prism-text-muted font-mono text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Active Filters:
          </span>
          {filters.map((f, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-prism-bg-card border border-prism-border-subtle text-prism-text-primary font-mono text-[11px]"
            >
              <span className="text-prism-accent-blue">{f.column}</span>
              <span className="text-prism-text-muted">{f.operator}</span>
              <span className="text-prism-text-primary font-semibold">&quot;{String(f.value)}&quot;</span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(idx)}
                className="hover:text-rose-400 transition-colors ml-1"
                aria-label={`Remove filter ${f.column}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setFilters([])}
            className="text-[11px] text-prism-text-muted hover:text-rose-400 underline transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={executeQuery}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-xs text-rose-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 3. Main Data Table & Pagination Container */}
      <div className="rounded-lg bg-prism-bg-card border border-prism-border-subtle overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-prism-bg-base/80 border-b border-prism-border-subtle">
                {currentDatasetMeta?.columns
                  .filter((c) => visibleColumns.includes(c.name))
                  .map((col) => {
                    const isSorted = sortBy === col.name;
                    return (
                      <th
                        key={col.name}
                        scope="col"
                        onClick={() => col.sortable && handleSort(col.name)}
                        className={`py-3 px-4 font-mono font-medium text-prism-text-muted uppercase tracking-wider text-[11px] whitespace-nowrap select-none ${
                          col.sortable ? 'cursor-pointer hover:text-prism-text-primary transition-colors' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.display_name}</span>
                          {col.sortable && (
                            <span className="text-prism-text-muted">
                              {isSorted ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-prism-accent-blue" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-prism-accent-blue" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody className="divide-y divide-prism-border-subtle/50 font-sans">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-16 text-center text-prism-text-muted font-mono"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-prism-accent-blue" />
                      <span>Querying DuckDB server boundary...</span>
                    </div>
                  </td>
                </tr>
              ) : queryResult && queryResult.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-16 text-center text-prism-text-muted font-mono"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>No matching records found for active filters.</span>
                      <span className="text-[11px]">Try adjusting your search or clearing filter parameters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                queryResult?.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-prism-bg-elevated/40 transition-colors"
                  >
                    {currentDatasetMeta?.columns
                      .filter((c) => visibleColumns.includes(c.name))
                      .map((col) => (
                        <td key={col.name} className="py-2.5 px-4 whitespace-nowrap">
                          {renderCell(col, row[col.name])}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-prism-bg-base/60 border-t border-prism-border-subtle text-xs font-mono">
          {/* Row count summary */}
          <div className="text-prism-text-muted">
            Showing{' '}
            <strong className="text-prism-text-primary">
              {queryResult?.total_rows ? (page - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-prism-text-primary">
              {Math.min(page * pageSize, queryResult?.total_rows || 0)}
            </strong>{' '}
            of <strong className="text-prism-text-primary">{formatInteger(queryResult?.total_rows || 0)}</strong> records
            {queryResult && (
              <span className="ml-2 text-[11px] text-prism-text-muted">({queryResult.execution_time_ms}ms)</span>
            )}
          </div>

          {/* Page navigation and page size selector */}
          <div className="flex items-center gap-3">
            {/* Page Size selector */}
            <div className="flex items-center gap-1.5 text-prism-text-muted">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="bg-prism-bg-card border border-prism-border-subtle rounded px-2 py-1 text-prism-text-primary text-xs focus:outline-none focus:border-prism-accent-blue"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1 rounded bg-prism-bg-card border border-prism-border-subtle text-prism-text-secondary hover:text-prism-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-prism-text-primary font-medium">
                Page {page} / {queryResult?.total_pages || 1}
              </span>

              <button
                type="button"
                disabled={page >= (queryResult?.total_pages || 1) || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded bg-prism-bg-card border border-prism-border-subtle text-prism-text-secondary hover:text-prism-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MODALS & DRAWERS ==================== */}

      {/* Filter Builder Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-prism-bg-card border border-prism-border-strong rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-prism-border-subtle pb-3">
              <h4 className="text-sm font-medium text-prism-text-primary flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-prism-accent-blue" />
                Add Filter to {currentDatasetMeta?.display_name}
              </h4>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="text-prism-text-muted hover:text-prism-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFilter} className="space-y-3">
              {/* Column selector */}
              <div>
                <label className="block text-xs font-mono text-prism-text-muted mb-1">Column</label>
                <select
                  value={newFilterColumn}
                  onChange={(e) => setNewFilterColumn(e.target.value)}
                  className="w-full bg-prism-bg-base border border-prism-border-subtle rounded-md px-3 py-1.5 text-xs text-prism-text-primary font-mono focus:outline-none focus:border-prism-accent-blue"
                >
                  {currentDatasetMeta?.columns
                    .filter((c) => c.filterable)
                    .map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.display_name} ({c.name})
                      </option>
                    ))}
                </select>
              </div>

              {/* Operator selector */}
              <div>
                <label className="block text-xs font-mono text-prism-text-muted mb-1">Operator</label>
                <select
                  value={newFilterOperator}
                  onChange={(e) => setNewFilterOperator(e.target.value as ExplorerFilterOperator)}
                  className="w-full bg-prism-bg-base border border-prism-border-subtle rounded-md px-3 py-1.5 text-xs text-prism-text-primary font-mono focus:outline-none focus:border-prism-accent-blue"
                >
                  <option value="eq">equals (=)</option>
                  <option value="neq">not equals (!=)</option>
                  <option value="contains">contains</option>
                  <option value="gt">greater than (&gt;)</option>
                  <option value="gte">greater or equal (&gt;=)</option>
                  <option value="lt">less than (&lt;)</option>
                  <option value="lte">less or equal (&lt;=)</option>
                </select>
              </div>

              {/* Value input */}
              <div>
                <label className="block text-xs font-mono text-prism-text-muted mb-1">Filter Value</label>
                <input
                  type="text"
                  required
                  placeholder="Enter exact or search value..."
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  className="w-full bg-prism-bg-base border border-prism-border-subtle rounded-md px-3 py-1.5 text-xs text-prism-text-primary font-mono focus:outline-none focus:border-prism-accent-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-prism-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-prism-text-muted hover:text-prism-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-prism-accent-blue text-black hover:bg-blue-400"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Column Visibility Selector Modal */}
      {showColumnsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-prism-bg-card border border-prism-border-strong rounded-xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-prism-border-subtle pb-3">
              <h4 className="text-sm font-medium text-prism-text-primary flex items-center gap-2">
                <Eye className="w-4 h-4 text-prism-accent-blue" />
                Select Visible Columns
              </h4>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="text-prism-text-muted hover:text-prism-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {currentDatasetMeta?.columns.map((c) => {
                const isChecked = visibleColumns.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className="flex items-center gap-2.5 p-1.5 rounded hover:bg-prism-bg-base text-xs font-mono cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleColumns((prev) => [...prev, c.name]);
                        } else {
                          if (visibleColumns.length > 1) {
                            setVisibleColumns((prev) => prev.filter((col) => col !== c.name));
                          }
                        }
                      }}
                      className="rounded border-prism-border-subtle bg-prism-bg-base text-prism-accent-blue"
                    />
                    <span className="text-prism-text-primary font-sans">{c.display_name}</span>
                    <span className="text-prism-text-muted text-[10px]">({c.name})</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-prism-border-subtle text-xs">
              <button
                type="button"
                onClick={() => {
                  if (currentDatasetMeta) setVisibleColumns(currentDatasetMeta.default_columns);
                }}
                className="text-prism-text-muted hover:text-prism-accent-blue underline"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="px-3 py-1 rounded bg-prism-bg-elevated hover:bg-prism-border-strong text-prism-text-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Information Drawer */}
      {showSchemaDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
          <div className="bg-prism-bg-card border-l border-prism-border-strong w-full max-w-lg p-6 space-y-5 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-prism-border-subtle pb-4">
              <div>
                <h3 className="text-base font-medium text-prism-text-primary flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-prism-accent-blue" />
                  {currentDatasetMeta?.display_name} Schema
                </h3>
                <p className="text-xs text-prism-text-muted mt-0.5">{currentDatasetMeta?.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaDrawer(false)}
                className="text-prism-text-muted hover:text-prism-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 bg-prism-bg-base rounded-lg border border-prism-border-subtle">
                <div>
                  <span className="text-prism-text-muted">Table Name:</span>{' '}
                  <span className="text-prism-text-primary">{currentDatasetMeta?.table_name}</span>
                </div>
                <div>
                  <span className="text-prism-text-muted">Primary Key:</span>{' '}
                  <span className="text-prism-accent-blue">{currentDatasetMeta?.primary_key}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-prism-text-muted">
                  Column Metadata ({currentDatasetMeta?.columns.length})
                </h4>
                <div className="divide-y divide-prism-border-subtle/60 border border-prism-border-subtle rounded-lg bg-prism-bg-base/40">
                  {currentDatasetMeta?.columns.map((c) => (
                    <div key={c.name} className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-prism-text-primary font-semibold">{c.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-prism-bg-elevated text-prism-accent-blue text-[10px]">
                          {c.data_type}
                        </span>
                      </div>
                      <p className="text-xs text-prism-text-secondary">{c.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-prism-text-muted pt-1">
                        <span>{c.nullable ? 'Nullable' : 'Non-Null'}</span>
                        <span>•</span>
                        <span>{c.filterable ? 'Filterable' : 'Non-filterable'}</span>
                        <span>•</span>
                        <span>{c.sortable ? 'Sortable' : 'Non-sortable'}</span>
                        {c.searchable && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">Searchable</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

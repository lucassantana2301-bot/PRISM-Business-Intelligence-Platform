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
      setError(err.message || 'Falha na consulta.');
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
      alert(`Exportação falhou: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Cell formatter
  const renderCell = (col: ColumnMetadata, val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-300">—</span>;

    if (col.format_type === 'currency') {
      return <span className="text-slate-900 font-mono font-medium">{formatCurrency(Number(val))}</span>;
    }
    if (col.format_type === 'integer') {
      return <span className="text-slate-700 font-mono">{formatInteger(Number(val))}</span>;
    }
    if (col.format_type === 'percentage') {
      return <span className="text-indigo-600 font-mono font-medium">{formatPercentage(Number(val) * 100, 1)}</span>;
    }
    if (col.format_type === 'boolean') {
      return val ? (
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">Sim</span>
      ) : (
        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px]">Não</span>
      );
    }
    if (col.format_type === 'badge') {
      let color = 'text-slate-700 bg-slate-100 border-slate-200';
      if (val === 'Completed' || val === 'VIP') color = 'text-emerald-800 bg-emerald-50 border-emerald-200/80';
      if (val === 'Processing' || val === 'Regular') color = 'text-blue-800 bg-blue-50 border-blue-200/80';
      if (val === 'Cancelled' || val === 'At-Risk') color = 'text-amber-800 bg-amber-50 border-amber-200/80';
      if (val === 'Churned') color = 'text-rose-800 bg-rose-50 border-rose-200/80';
      return <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border ${color}`}>{val}</span>;
    }
    if (col.format_type === 'datetime') {
      return <span className="text-slate-600 font-mono text-xs">{String(val)}</span>;
    }

    return <span className="text-slate-800 text-xs truncate max-w-[220px] inline-block">{String(val)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 1. Dataset Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
        {datasets.map((d) => {
          const isSelected = selectedDataset === d.dataset_id;
          return (
            <button
              key={d.dataset_id}
              type="button"
              onClick={() => handleDatasetSwitch(d.dataset_id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
              }`}
            >
              <TableIcon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{d.display_name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                isSelected ? 'bg-indigo-100 text-indigo-800 font-bold' : 'bg-slate-100 text-slate-500'
              }`}>
                {formatInteger(d.row_count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Exploration Control Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar em ${currentDatasetMeta?.display_name || 'registros'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono transition-colors"
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
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filtro</span>
            {filters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                {filters.length}
              </span>
            )}
          </button>

          {/* Column Picker Button */}
          <button
            type="button"
            onClick={() => setShowColumnsModal(!showColumnsModal)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Colunas ({visibleColumns.length})</span>
          </button>

          {/* Schema Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowSchemaDrawer(!showSchemaDrawer)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Schema</span>
          </button>

          {/* CSV Export Button */}
          <button
            type="button"
            disabled={isExporting || isLoading}
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExporting ? 'Exportando…' : 'Exportar CSV'}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtros ativos:
          </span>
          {filters.map((f, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-mono text-[11px]"
            >
              <span className="font-semibold text-indigo-700">{f.column}</span>
              <span className="text-indigo-400">{f.operator}</span>
              <span className="text-indigo-900 font-bold">&quot;{String(f.value)}&quot;</span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(idx)}
                className="hover:text-rose-600 transition-colors ml-1 text-indigo-400"
                aria-label={`Remover filtro ${f.column}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setFilters([])}
            className="text-[11px] text-slate-500 hover:text-rose-600 underline transition-colors"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={executeQuery}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100/50 border border-rose-200 text-xs text-rose-800 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </button>
        </div>
      )}

      {/* 3. Main Data Table Container */}
      <div className="prism-panel-master overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80">
                {currentDatasetMeta?.columns
                  .filter((c) => visibleColumns.includes(c.name))
                  .map((col) => {
                    const isSorted = sortBy === col.name;
                    return (
                      <th
                        key={col.name}
                        scope="col"
                        onClick={() => col.sortable && handleSort(col.name)}
                        className={`py-3.5 px-4 font-mono font-semibold text-slate-600 uppercase tracking-wider text-[10px] whitespace-nowrap select-none ${
                          col.sortable ? 'cursor-pointer hover:text-indigo-600 transition-colors' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.display_name}</span>
                          {col.sortable && (
                            <span className="text-slate-400">
                              {isSorted ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
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
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-20 text-center text-slate-400 font-mono"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Consultando vetorização DuckDB...</span>
                    </div>
                  </td>
                </tr>
              ) : queryResult && queryResult.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-20 text-center text-slate-400 font-mono"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-700 font-medium">Nenhum registro encontrado com os filtros atuais.</span>
                      <span className="text-xs">Tente ajustar a busca ou remover critérios de filtro.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                queryResult?.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {currentDatasetMeta?.columns
                      .filter((c) => visibleColumns.includes(c.name))
                      .map((col) => (
                        <td key={col.name} className="py-3 px-4 whitespace-nowrap">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/60 border-t border-slate-200/80 text-xs font-mono">
          {/* Row count summary */}
          <div className="text-slate-500">
            Exibindo{' '}
            <strong className="text-slate-900 font-bold">
              {queryResult?.total_rows ? (page - 1) * pageSize + 1 : 0}
            </strong>{' '}
            a{' '}
            <strong className="text-slate-900 font-bold">
              {Math.min(page * pageSize, queryResult?.total_rows || 0)}
            </strong>{' '}
            de <strong className="text-slate-900 font-bold">{formatInteger(queryResult?.total_rows || 0)}</strong> registros
            {queryResult && (
              <span className="ml-2 text-slate-400">({queryResult.execution_time_ms}ms)</span>
            )}
          </div>

          {/* Page navigation and page size selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Linhas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-slate-900 font-semibold">
                Pág. {page} / {queryResult?.total_pages || 1}
              </span>

              <button
                type="button"
                disabled={page >= (queryResult?.total_pages || 1) || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                aria-label="Próxima página"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Adicionar Filtro · {currentDatasetMeta?.display_name}
              </h4>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFilter} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-600 mb-1.5">Coluna</label>
                <select
                  value={newFilterColumn}
                  onChange={(e) => setNewFilterColumn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
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

              <div>
                <label className="block text-xs font-mono font-medium text-slate-600 mb-1.5">Operador</label>
                <select
                  value={newFilterOperator}
                  onChange={(e) => setNewFilterOperator(e.target.value as ExplorerFilterOperator)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="eq">igual a (=)</option>
                  <option value="neq">diferente de (!=)</option>
                  <option value="contains">contém</option>
                  <option value="gt">maior que (&gt;)</option>
                  <option value="gte">maior ou igual (&gt;=)</option>
                  <option value="lt">menor que (&lt;)</option>
                  <option value="lte">menor ou igual (&lt;=)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-600 mb-1.5">Valor do Filtro</label>
                <input
                  type="text"
                  required
                  placeholder="Insira o valor exato ou termo..."
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Aplicar Filtro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Column Visibility Selector Modal */}
      {showColumnsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                Colunas Visíveis
              </h4>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {currentDatasetMeta?.columns.map((c) => {
                const isChecked = visibleColumns.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 text-xs font-mono cursor-pointer transition-colors"
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
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-900 font-sans font-medium">{c.display_name}</span>
                    <span className="text-slate-400 text-[10px]">({c.name})</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (currentDatasetMeta) setVisibleColumns(currentDatasetMeta.default_columns);
                }}
                className="text-slate-500 hover:text-indigo-600 underline font-medium"
              >
                Restaurar Padrão
              </button>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Information Drawer */}
      {showSchemaDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white border-l border-slate-200 w-full max-w-lg p-6 space-y-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  Schema: {currentDatasetMeta?.display_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{currentDatasetMeta?.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaDrawer(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tabela DuckDB:</span>
                  <span className="text-slate-900 font-semibold">{currentDatasetMeta?.table_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Chave Primária:</span>
                  <span className="text-indigo-600 font-semibold">{currentDatasetMeta?.primary_key}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Metadados de Colunas ({currentDatasetMeta?.columns.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                  {currentDatasetMeta?.columns.map((c) => (
                    <div key={c.name} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-900 font-semibold">{c.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          {c.data_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{c.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        <span>{c.nullable ? 'Anulável' : 'Não nulo'}</span>
                        <span>•</span>
                        <span>{c.filterable ? 'Filtrável' : 'Não filtrável'}</span>
                        <span>•</span>
                        <span>{c.sortable ? 'Ordenável' : 'Não ordenável'}</span>
                        {c.searchable && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">Buscável</span>
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

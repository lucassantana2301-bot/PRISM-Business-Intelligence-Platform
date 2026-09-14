/**
 * PRISM Data Explorer Contracts
 * Authoritative TypeScript definitions mirroring apps/api/src/explorer/*
 */

export type DataType = 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'date';
export type FormatType = 'text' | 'currency' | 'integer' | 'percentage' | 'datetime' | 'badge' | 'boolean';

export interface ColumnMetadata {
  name: string;
  display_name: string;
  data_type: DataType;
  description: string;
  nullable: boolean;
  filterable: boolean;
  sortable: boolean;
  searchable: boolean;
  format_type: FormatType;
}

export interface DatasetMetadata {
  dataset_id: string;
  display_name: string;
  description: string;
  table_name: string;
  primary_key: string;
  default_columns: string[];
  columns: ColumnMetadata[];
  row_count?: number;
}

export type ExplorerFilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'in'
  | 'not_in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between';

export interface ExplorerFilter {
  column: string;
  operator: ExplorerFilterOperator;
  value: string | number | boolean | (string | number | boolean)[];
}

export type SortDirection = 'asc' | 'desc';

export interface ExplorerQuery {
  dataset: string;
  columns?: string[];
  search?: string;
  filters?: ExplorerFilter[];
  sort_by?: string;
  sort_direction?: SortDirection;
  page?: number;
  page_size?: number;
}

export interface ExplorerQueryResult {
  dataset: string;
  rows: Record<string, any>[];
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  execution_time_ms: number;
}

export interface ExplorerExportQuery {
  dataset: string;
  columns?: string[];
  search?: string;
  filters?: ExplorerFilter[];
  sort_by?: string;
  sort_direction?: SortDirection;
  limit?: number;
}

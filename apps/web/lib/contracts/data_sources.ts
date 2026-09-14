/**
 * PRISM Data Sources & Warehouse Provider Contracts
 * Strict provider specifications for DuckDB, PostgreSQL / Neon, and BigQuery.
 */

export type DataSourceType = 'duckdb' | 'postgresql' | 'bigquery';
export type DataSourceStatus = 'connected' | 'demo_mode' | 'configured' | 'unconfigured';

export interface TableCatalogItem {
  table_name: string;
  row_count: number;
  description: string;
  columns: string[];
}

export interface GovernancePolicy {
  read_only_enforced: boolean;
  max_result_limit: number;
  query_timeout_ms: number;
  ast_validation: boolean;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  is_default: boolean;
  description: string;
  endpoint_redacted?: string;
  latency_ms: number;
  last_checked: string;
  available_tables: TableCatalogItem[];
  governance: GovernancePolicy;
}

export interface DataSourcesResponse {
  active_source: DataSourceInfo;
  sources: DataSourceInfo[];
  total_tables: number;
  total_rows: number;
  governance_summary: string;
}

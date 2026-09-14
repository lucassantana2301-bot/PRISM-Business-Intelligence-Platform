import React from 'react';
import { Table } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { OrdersExplorer } from '@/components/explorer/OrdersExplorer';
import { mockOrdersData } from '@/lib/mock/ecommerce';

export default function DataExplorerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Explorer"
        description="Explore a sample of order records. Search, sort, and export the rows shown in this preview."
        badge={<StatusBadge status="cached" label="Sample data" />}
      />

      {/* Table Selector & Metadata Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-prism-bg-card border border-prism-border-subtle">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-prism-text-muted flex items-center gap-1">
            <Table className="w-3.5 h-3.5" aria-hidden="true" />
            Table:
          </span>

          <span className="text-xs font-mono text-prism-text-primary">orders (sample preview)</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-prism-text-muted">
          <span>Schema: <span className="text-prism-text-primary">analytics.orders</span></span>
        </div>
      </div>

      {/* Virtualized Table (Client Island) */}
      <OrdersExplorer initialData={mockOrdersData} />
    </div>
  );
}

'use client';

import React from 'react';
import { DataTableShell, ColumnDef } from '@/components/ui/DataTableShell';
import { OrderRecord } from '@/lib/mock/ecommerce';

export interface OrdersExplorerProps {
  initialData: OrderRecord[];
}

export const OrdersExplorer: React.FC<OrdersExplorerProps> = ({ initialData }) => {
  const columns: ColumnDef<OrderRecord>[] = [
    { key: 'order_id', header: 'Order ID', width: '120px' },
    { key: 'customer_name', header: 'Customer', width: '160px' },
    { key: 'category', header: 'Category', width: '140px' },
    { key: 'region', header: 'Region', width: '80px', align: 'center' },
    { key: 'payment_method', header: 'Payment', width: '120px' },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (row) => (
        <span
          className={
            row.status === 'Completed'
              ? 'text-emerald-400 font-mono text-[11px]'
              : row.status === 'Processing'
              ? 'text-blue-400 font-mono text-[11px]'
              : 'text-amber-400 font-mono text-[11px]'
          }
        >
          ● {row.status}
        </span>
      ),
    },
    { key: 'total_revenue', header: 'Revenue', width: '120px', align: 'right' },
    { key: 'order_date', header: 'Timestamp', width: '160px', align: 'right' },
  ];

  return (
    <DataTableShell
      columns={columns}
      data={initialData}
      pageSize={5}
      tableName="orders_sample"
    />
  );
};

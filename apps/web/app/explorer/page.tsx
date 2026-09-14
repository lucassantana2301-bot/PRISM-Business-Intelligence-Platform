import React, { Suspense } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataExplorerClient } from '@/components/explorer/DataExplorerClient';

export default function DataExplorerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Explorer"
        description="Explore, filter, and analyze canonical dataset records with server-side pagination, sorting, and safe export."
      />

      <Suspense
        fallback={
          <div className="p-12 text-center text-xs font-mono text-prism-text-muted">
            Initializing Data Explorer registry...
          </div>
        }
      >
        <DataExplorerClient />
      </Suspense>
    </div>
  );
}

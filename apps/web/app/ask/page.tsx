import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AskPrismClient } from '@/components/ask/AskPrismClient';

export default function AskPrismPage() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <PageHeader
        title="Ask PRISM"
        description="Conversational analytics grounded in PRISM's canonical semantic layer and DuckDB execution engine."
      />

      <AskPrismClient />
    </div>
  );
}

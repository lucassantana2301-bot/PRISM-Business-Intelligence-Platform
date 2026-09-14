import { MessageSquareCode } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';

export default function AskPrismPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Ask PRISM"
        description="Explore your data with natural language when conversational analytics launches."
        badge={<StatusBadge status="processing" label="Phase 06 preview" />}
      />
      <div className="rounded-xl border border-prism-border-subtle bg-prism-bg-card px-6 py-16 text-center">
        <MessageSquareCode className="mx-auto mb-4 h-8 w-8 text-prism-accent-blue" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-prism-text-primary">Conversational analytics is coming</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-prism-text-secondary">
          Ask PRISM is planned for Phase 06. Natural-language queries, validated SQL, and generated answers are not available in this preview.
        </p>
      </div>
    </div>
  );
}

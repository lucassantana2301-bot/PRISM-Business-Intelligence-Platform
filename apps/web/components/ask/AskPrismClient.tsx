'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Send } from 'lucide-react';
import { AskPrismResponse, ConversationContext } from '@/lib/contracts/ask';
import { askPrism } from '@/lib/api/ask_client';
import { VisualizationRenderer } from '@/components/visualization/VisualizationRenderer';
import { VoiceInteractionButton } from '@/components/voice/VoiceInteractionButton';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatExecutionTime, formatMetricValue } from '@/lib/utils/formatters';

interface RefractionTurn {
  id: string;
  question: string;
  response?: AskPrismResponse;
  error?: string;
}

const suggestions = [
  'Qual foi o faturamento nos últimos 30 dias?',
  'Compare a conversão Mobile com Desktop.',
  'Mostre a receita por categoria.',
];

const NarrativeLine: React.FC<{ text: string }> = ({ text }) => (
  <p>
    {text.split('**').map((part, index) =>
      index % 2 === 1 ? <strong key={`${part}-${index}`} className="font-semibold">{part}</strong> : part
    )}
  </p>
);

export const AskPrismClient: React.FC = () => {
  const [turns, setTurns] = useState<RefractionTurn[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialQuestion = new URLSearchParams(window.location.search).get('q');
    if (initialQuestion) setInput(initialQuestion);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [turns, isLoading]);

  const submit = async (candidate?: string) => {
    const question = (candidate ?? input).trim();
    if (!question || isLoading) return;
    const id = `turn-${Date.now()}`;
    setTurns((current) => [...current, { id, question }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await askPrism({ message: question, context });
      setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, response } : turn));
      setContext(response.context);
    } catch (caught) {
      const error = caught instanceof Error ? caught.message : 'Falha ao consultar o motor analítico.';
      setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, error } : turn));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => { setTurns([]); setContext(null); setInput(''); inputRef.current?.focus(); };
  const latestAnswer = [...turns].reverse().find((turn) => turn.response)?.response?.answer ?? null;

  return (
    <section className="prism-query-workspace prism-panel p-5 sm:p-8" aria-labelledby="query-workspace-title">
      <header className="flex flex-col gap-5 border-b border-prism-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <AnalyticalCoordinate dimension="monetary">REFRACTION QUERY · LIVE ENGINE</AnalyticalCoordinate>
          <h2 id="query-workspace-title" className="mt-2.5 text-2xl font-semibold tracking-[-0.03em] text-prism-ink sm:text-[1.625rem]">Da pergunta à evidência</h2>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-prism-muted">Cada resposta expõe a interpretação do motor, os resultados calculados e a narrativa retornada.</p>
        </div>
        <button type="button" onClick={reset} className="prism-secondary-button self-start text-prism-muted hover:text-prism-ink"><RotateCcw className="h-3.5 w-3.5" />Nova análise</button>
      </header>

      {turns.length === 0 && (
        <div className="grid gap-px overflow-hidden rounded-xl border border-prism-hairline bg-prism-hairline mt-6 md:grid-cols-3">
          {suggestions.map((suggestion, index) => <button key={suggestion} type="button" onClick={() => void submit(suggestion)} className="min-h-28 bg-white p-5 text-left transition-colors duration-150 hover:bg-prism-porcelain"><AnalyticalCoordinate>SRC.Q{index + 1}</AnalyticalCoordinate><span className="mt-3 block text-sm leading-5 text-prism-ink">{suggestion}</span></button>)}
        </div>
      )}

      <div className="divide-y divide-prism-hairline" aria-live="polite">
        {turns.map((turn, index) => {
          const response = turn.response;
          const summaries = response?.result ? Object.values(response.result.metrics_summary) : [];
          return (
            <article key={turn.id} className="py-8 sm:py-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(15rem,.72fr)_2rem_minmax(0,1.6fr)]">
                <div>
                  <AnalyticalCoordinate dimension="monetary">SRC.Q{index + 1} · QUESTION</AnalyticalCoordinate>
                  <p className="mt-5 text-xl font-semibold leading-8 tracking-[-0.025em] text-prism-ink">{turn.question}</p>
                  {response && <p className="mt-6 font-mono text-[10px] text-prism-muted">TURN {response.context.turn_count} · {formatExecutionTime(response.execution_time_ms)}</p>}
                </div>
                <div className="hidden items-center justify-center xl:flex" aria-hidden="true"><div className="h-full w-px bg-prism-hairline" /><ArrowRight className="absolute h-4 w-4 bg-prism-porcelain text-prism-indigo" /></div>
                <div className="min-w-0">
                  {!response && !turn.error && <div className="prism-processing" role="status"><span className="h-2 w-2 bg-prism-indigo" /><span>PRISM está decompondo a pergunta…</span></div>}
                  {turn.error && <div role="alert" className="rounded-lg border-l-2 border-prism-negative bg-red-50 p-4 text-xs leading-5 text-red-800"><AnalyticalCoordinate>QUERY ERROR</AnalyticalCoordinate><p className="mt-2">{turn.error}</p></div>}
                  {response && (
                    <div className="space-y-8">
                      <section aria-labelledby={`${turn.id}-analysis`}>
                        <AnalyticalCoordinate dimension="behavioral">ANL.{String(index + 1).padStart(2, '0')} · ANALYSIS</AnalyticalCoordinate>
                        <h3 id={`${turn.id}-analysis`} className="sr-only">Análise da pergunta</h3>
                        <p className="mt-3 text-sm font-medium text-prism-ink">{response.intent.intent_summary}</p>
                        <dl className="mt-4 grid gap-px overflow-hidden rounded-lg border border-prism-hairline bg-prism-hairline sm:grid-cols-3">
                          <div className="bg-white p-3"><dt className="query-term">Métricas</dt><dd className="query-value">{response.intent.metrics.join(', ') || 'Nenhuma'}</dd></div>
                          <div className="bg-white p-3"><dt className="query-term">Dimensões</dt><dd className="query-value">{response.intent.dimensions.join(', ') || 'Nenhuma'}</dd></div>
                          <div className="bg-white p-3"><dt className="query-term">Janela</dt><dd className="query-value">{response.intent.start_date} → {response.intent.end_date}</dd></div>
                        </dl>
                      </section>

                      <section aria-labelledby={`${turn.id}-evidence`}>
                        <AnalyticalCoordinate dimension="structural">EVD.{String(index + 1).padStart(2, '0')} · EVIDENCE</AnalyticalCoordinate>
                        <h3 id={`${turn.id}-evidence`} className="sr-only">Evidências retornadas</h3>
                        {summaries.length > 0 && <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-prism-hairline bg-prism-hairline sm:grid-cols-2">{summaries.map((summary) => <div key={summary.metric_id} className="bg-white p-4"><p className="query-term">{summary.metric_id.replaceAll('_', ' ')}</p><p className="mt-2 text-xl font-semibold text-prism-ink tabular-nums">{formatMetricValue(summary.current_value, summary.format_type)}</p></div>)}</div>}
                        {response.visualization ? <div className="mt-4 rounded-lg border border-prism-hairline p-4"><VisualizationRenderer spec={response.visualization} /></div> : <p className="mt-3 text-xs text-prism-muted">Nenhuma visualização foi necessária para este resultado.</p>}
                      </section>

                      <section className="border-l-2 border-prism-indigo pl-5" aria-labelledby={`${turn.id}-decision`}>
                        <AnalyticalCoordinate dimension="monetary">DEC.{String(index + 1).padStart(2, '0')} · DECISION</AnalyticalCoordinate>
                        <h3 id={`${turn.id}-decision`} className="sr-only">Conclusão retornada pelo PRISM</h3>
                        <div className="mt-4 space-y-2 text-base font-medium leading-7 text-prism-ink">{response.answer.split('\n').map((line, lineIndex) => <NarrativeLine key={lineIndex} text={line} />)}</div>
                        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-prism-muted">Narrativa retornada pelo motor PRISM · confiança {(response.confidence * 100).toFixed(0)}%</p>
                      </section>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        <div ref={endRef} />
      </div>

      <footer className="mt-8 border-t border-prism-hairline pt-6">
        <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="flex items-center gap-2">
          <label htmlFor="prism-question" className="sr-only">Pergunte ao PRISM</label>
          <input id="prism-question" ref={inputRef} value={input} disabled={isLoading} onChange={(event) => setInput(event.target.value)} placeholder="Faça uma pergunta sobre o negócio…" className="h-12 min-w-0 flex-1 rounded-lg border border-prism-hairline bg-white px-4 text-sm text-prism-ink outline-none placeholder:text-prism-muted focus:border-prism-indigo disabled:opacity-60" />
          <VoiceInteractionButton onTranscriptComplete={(transcript) => void submit(transcript)} isEngineBusy={isLoading} latestAnswer={latestAnswer} />
          <button type="submit" disabled={!input.trim() || isLoading} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-prism-indigo text-white transition-colors duration-150 hover:bg-prism-accent-blueDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Executar pergunta"><Send className="h-4 w-4" /></button>
        </form>
      </footer>
    </section>
  );
};

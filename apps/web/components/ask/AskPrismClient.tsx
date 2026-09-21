'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Send, Sparkles, Database, Layers, CheckCircle2, Terminal, ShieldCheck, Zap, Copy, Check, MessageSquare } from 'lucide-react';
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
  {
    tag: 'RECEITA & TICKET',
    question: 'Qual foi o faturamento nos últimos 30 dias?',
    desc: 'Receita total, pedidos concluídos e ticket médio com comparação temporal.',
  },
  {
    tag: 'CONVERSÃO & CANAIS',
    question: 'Compare a conversão Mobile com Desktop.',
    desc: 'Taxas de finalização de checkout por plataforma e volume de sessões.',
  },
  {
    tag: 'CATEGORIAS & MIX',
    question: 'Mostre a receita por categoria.',
    desc: 'Distribuição dimensional por linha de produto e volume de itens.',
  },
];

const NarrativeLine: React.FC<{ text: string }> = ({ text }) => (
  <p className="leading-relaxed">
    {text.split('**').map((part, index) =>
      index % 2 === 1 ? <strong key={`${part}-${index}`} className="font-semibold text-slate-900">{part}</strong> : part
    )}
  </p>
);

export const AskPrismClient: React.FC = () => {
  const [turns, setTurns] = useState<RefractionTurn[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
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

  const copyToClipboard = async (text: string, turnId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTurnId(turnId);
      setTimeout(() => setCopiedTurnId(null), 2000);
    } catch {
      // Fallback
    }
  };

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

  const reset = () => {
    setTurns([]);
    setContext(null);
    setInput('');
    inputRef.current?.focus();
  };

  const latestAnswer = [...turns].reverse().find((turn) => turn.response)?.response?.answer ?? null;

  return (
    <div className="space-y-6">
      {/* Query Control Master Panel */}
      <section className="prism-panel-master p-6 sm:p-8" aria-labelledby="query-workspace-title">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-mono font-semibold text-indigo-700 tracking-wider uppercase">
                <Zap className="w-3 h-3 text-indigo-600" />
                Refraction Engine v2
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-[10px] font-mono font-semibold text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                AST Validated
              </span>
            </div>
            <h2 id="query-workspace-title" className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Da pergunta em linguagem natural à evidência computada
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl leading-relaxed">
              Interpretação semântica com decomposição de intenção, geração de AST estritamente de leitura e síntese executiva.
            </p>
          </div>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs self-start"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              Nova análise
            </button>
          )}
        </header>

        {/* Suggestion Prompts if No Turns */}
        {turns.length === 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Consultas sugeridas de alto impacto
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {suggestions.map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => void submit(item.question)}
                  className="group relative flex flex-col justify-between p-5 text-left rounded-xl bg-gradient-to-b from-slate-50/90 to-slate-50/50 hover:from-white hover:to-indigo-50/30 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-2xs hover:shadow-md hover-lift"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors shadow-2xs">
                      {item.tag}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-indigo-950 transition-colors">
                      &ldquo;{item.question}&rdquo;
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1">
                    <span>Executar refração</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation / Turns Stream */}
        <div className="divide-y divide-slate-200/80" aria-live="polite">
          {turns.map((turn, index) => {
            const response = turn.response;
            const summaries = response?.result ? Object.values(response.result.metrics_summary) : [];
            return (
              <article key={turn.id} className="py-8 sm:py-10 space-y-6">
                {/* Question Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          SRC.Q{index + 1} · CONSULTA
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-white mt-0.5">
                        {turn.question}
                      </p>
                    </div>
                  </div>
                  {response && (
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0 self-end sm:self-center">
                      <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        TURN {response.context.turn_count}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400">
                        {formatExecutionTime(response.execution_time_ms)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Loading state */}
                {!response && !turn.error && (
                  <div className="p-8 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-center gap-3 text-indigo-900 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>PRISM está decompondo a intenção e executando as validações AST no DuckDB…</span>
                  </div>
                )}

                {/* Error state */}
                {turn.error && (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-xs leading-5 text-rose-900">
                    <div className="flex items-center gap-2 font-mono font-semibold text-rose-700 uppercase tracking-wider">
                      <span>ERRO DE PROCESSAMENTO</span>
                    </div>
                    <p className="mt-2 text-sm">{turn.error}</p>
                  </div>
                )}

                {/* Response Breakdown */}
                {response && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Deconstruction & Evidence (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Step 1: Semantic Intent Deconstruction */}
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <AnalyticalCoordinate dimension="behavioral">
                            ANL.{String(index + 1).padStart(2, '0')} · INTENT DECOMPOSITION
                          </AnalyticalCoordinate>
                          <span className="text-[10px] font-mono text-slate-500">AST PARSER</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {response.intent.intent_summary}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 block uppercase">Métricas</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">
                              {response.intent.metrics.join(', ') || 'Nenhuma'}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 block uppercase">Dimensões</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">
                              {response.intent.dimensions.join(', ') || 'Nenhuma'}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 block uppercase">Janela</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5">
                              {response.intent.start_date} → {response.intent.end_date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Evidence & Metrics Summary */}
                      <div className="p-5 rounded-xl bg-white border border-slate-200/80 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <AnalyticalCoordinate dimension="structural">
                            EVD.{String(index + 1).padStart(2, '0')} · EVIDENCE & METRICS
                          </AnalyticalCoordinate>
                          <span className="text-[10px] font-mono text-slate-500">VECTORIZED MART</span>
                        </div>

                        {summaries.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {summaries.map((summary) => (
                              <div key={summary.metric_id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                                  {summary.metric_id.replaceAll('_', ' ')}
                                </span>
                                <span className="mt-1 text-xl font-bold text-slate-900 tabular-nums block font-mono">
                                  {formatMetricValue(summary.current_value, summary.format_type)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {response.visualization ? (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <VisualizationRenderer spec={response.visualization} />
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Nenhuma visualização adicional necessária para esta resposta.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Decision Synthesis (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-200/80 shadow-2xs hover:border-indigo-300 transition-colors">
                      <div>
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                          <AnalyticalCoordinate dimension="monetary">
                            DEC.{String(index + 1).padStart(2, '0')} · SYNTHESIS & ACTIONS
                          </AnalyticalCoordinate>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void copyToClipboard(response.answer, turn.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 transition-all shadow-2xs"
                              title="Copiar resposta sintetizada"
                            >
                              {copiedTurnId === turn.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              {(response.confidence * 100).toFixed(0)}% Confiança
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 text-sm font-normal text-slate-700">
                          {response.answer.split('\n').map((line, lineIndex) => (
                            <NarrativeLine key={lineIndex} text={line} />
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                          <Zap className="w-3 h-3 text-indigo-500" />
                          PRISM NATURAL SYNTHESIS
                        </span>
                        <span>TURN #{response.context.turn_count}</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input Bar Footer */}
        <footer className="mt-8 border-t border-slate-200/80 pt-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-inner"
          >
            <label htmlFor="prism-question" className="sr-only">Pergunte ao PRISM</label>
            <input
              id="prism-question"
              ref={inputRef}
              value={input}
              disabled={isLoading}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Faça uma pergunta sobre faturamento, canais, retenção ou categorias…"
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
            />
            <div className="flex items-center gap-2 shrink-0">
              <VoiceInteractionButton
                onTranscriptComplete={(transcript) => void submit(transcript)}
                isEngineBusy={isLoading}
                latestAnswer={latestAnswer}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors duration-150 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Executar pergunta"
              >
                <span>Perguntar</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </footer>
      </section>
    </div>
  );
};

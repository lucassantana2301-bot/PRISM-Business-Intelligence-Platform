'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Code2,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ConversationContext,
  VisualizationSpec,
} from '@/lib/contracts/ask';
import { askPrism } from '@/lib/api/ask_client';
import { formatCurrency, formatInteger, formatDelta } from '@/lib/utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'user' | 'prism';
  text: string;
  timestamp: string;
  visualization?: VisualizationSpec | null;
  queryDetails?: {
    metrics: string[];
    dimensions: string[];
    date_range: string;
    execution_time_ms: number;
  };
}

const SUGGESTED_QUESTIONS = [
  'Qual foi o faturamento nos últimos 30 dias?',
  'Quantos pedidos tivemos este mês?',
  'Qual região teve maior faturamento?',
  'Mostre a receita por categoria.',
  'Qual dispositivo teve a pior conversão?',
  'Compare a conversão Mobile com Desktop.',
  'Como o faturamento deste mês compara com o mês anterior?',
  'Quais foram os produtos com maior receita?',
  'Qual canal trouxe mais sessões?',
  'Qual campanha teve melhor ROAS?',
  'Mostre a evolução semanal da receita.',
];

export const AskPrismClient: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openInspectors, setOpenInspectors] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleInspector = (id: string) => {
    setOpenInspectors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askPrism({
        message: queryText,
        context,
      });

      const prismMsgId = `prism-${Date.now()}`;
      const prismMsg: ChatMessage = {
        id: prismMsgId,
        sender: 'prism',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visualization: response.visualization,
        queryDetails: {
          metrics: response.intent.metrics,
          dimensions: response.intent.dimensions,
          date_range: `${response.intent.start_date} → ${response.intent.end_date}`,
          execution_time_ms: response.execution_time_ms,
        },
      };

      setMessages((prev) => [...prev, prismMsg]);
      setContext(response.context);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'prism',
        text: `Desculpe, ocorreu um erro ao consultar o motor analítico: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleResetContext = () => {
    setContext(null);
    setMessages([]);
    setInputMessage('');
    inputRef.current?.focus();
  };

  // Inline visualization renderer
  const renderVisualization = (viz?: VisualizationSpec | null) => {
    if (!viz) return null;
    if (viz.type === 'metric') {
      return (
        <div className="mt-3 p-4 rounded-lg bg-prism-bg-base/80 border border-prism-border-subtle max-w-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-prism-text-muted">{viz.metric_label || 'Metric'}</span>
            <Sparkles className="w-3.5 h-3.5 text-prism-accent-blue" />
          </div>
          <div className="text-xl font-bold font-mono text-prism-text-primary">{viz.metric_value}</div>
          {viz.delta !== null && viz.delta !== undefined && (
            <div className="flex items-center gap-1.5 pt-1 text-xs font-mono">
              <span className={`px-1.5 py-0.5 rounded text-[11px] ${viz.is_favorable ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'}`}>
                {formatDelta(viz.delta)}
              </span>
              {viz.comparison_label && (
                <span className="text-prism-text-muted text-[11px]">{viz.comparison_label}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (viz.type === 'bar' && viz.series && viz.series.length > 0) {
      const xKey = viz.x_axis || 'name';
      const yKey = viz.y_axis || 'revenue';
      return (
        <div className="mt-3 p-4 rounded-lg bg-prism-bg-base/80 border border-prism-border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-prism-text-muted">
            <span className="font-medium text-prism-text-primary">{viz.title}</span>
            <BarChart3 className="w-3.5 h-3.5 text-prism-accent-blue" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viz.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
                <XAxis dataKey={xKey} stroke="#8A99AD" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A99AD" fontSize={10} tickLine={false} tickFormatter={(v) => typeof v === 'number' && v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `${v}`} />
                <Tooltip
                  formatter={(val: any) => [typeof val === 'number' && val > 100 ? formatCurrency(val) : val, yKey]}
                  contentStyle={{ backgroundColor: '#11131A', borderColor: '#363D4F', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC' }}
                />
                <Bar dataKey={yKey} fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (viz.type === 'area' && viz.series && viz.series.length > 0) {
      const xKey = viz.x_axis || 'timestamp';
      const yKey = viz.y_axis || 'net_revenue';
      return (
        <div className="mt-3 p-4 rounded-lg bg-prism-bg-base/80 border border-prism-border-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-prism-text-muted">
            <span className="font-medium text-prism-text-primary">{viz.title}</span>
            <TrendingUp className="w-3.5 h-3.5 text-prism-accent-blue" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viz.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2230" vertical={false} />
                <XAxis dataKey={xKey} stroke="#8A99AD" fontSize={10} tickLine={false} tickFormatter={(d) => String(d).substring(5)} />
                <YAxis stroke="#8A99AD" fontSize={10} tickLine={false} tickFormatter={(v) => typeof v === 'number' && v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `${v}`} />
                <Tooltip
                  formatter={(val: any) => [typeof val === 'number' ? formatCurrency(val) : val, yKey]}
                  contentStyle={{ backgroundColor: '#11131A', borderColor: '#363D4F', borderRadius: '8px', fontSize: '11px', color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey={yKey} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (viz.type === 'table' && viz.series && viz.series.length > 0) {
      const keys = Object.keys(viz.series[0] || {}).slice(0, 4);
      return (
        <div className="mt-3 rounded-lg border border-prism-border-subtle overflow-hidden bg-prism-bg-base/60 text-xs">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-prism-bg-elevated/80 border-b border-prism-border-subtle text-[10px] text-prism-text-muted uppercase">
                {keys.map((k) => (
                  <th key={k} className="py-2 px-3">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-prism-border-subtle/40 text-xs">
              {viz.series.slice(0, 5).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-prism-bg-elevated/30">
                  {keys.map((k) => (
                    <td key={k} className="py-2 px-3 text-prism-text-secondary">
                      {typeof row[k] === 'number' && row[k] > 100 ? formatCurrency(row[k], true) : String(row[k] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] rounded-xl bg-prism-bg-card border border-prism-border-subtle overflow-hidden">
      {/* 1. Header Bar with Context Pills & Reset */}
      <div className="flex items-center justify-between px-4 py-3 bg-prism-bg-base/80 border-b border-prism-border-subtle">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-prism-bg-card border border-prism-border-subtle text-xs font-mono text-prism-text-primary">
            <Bot className="w-3.5 h-3.5 text-prism-accent-blue" />
            <span>Ask PRISM Core</span>
          </div>

          {context && context.turn_count > 0 && (
            <>
              {context.active_start_date && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-prism-bg-elevated text-prism-text-secondary border border-prism-border-subtle">
                  <Calendar className="w-3 h-3 text-prism-accent-blue" />
                  {context.active_start_date} → {context.active_end_date}
                </span>
              )}
              {context.last_dimensions && context.last_dimensions.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-prism-bg-elevated text-prism-accent-purple border border-prism-border-subtle">
                  <Layers className="w-3 h-3" />
                  {context.last_dimensions.join(', ')}
                </span>
              )}
              <span className="text-[10px] font-mono text-prism-text-muted">
                Turn {context.turn_count}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleResetContext}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-bg-elevated border border-transparent hover:border-prism-border-subtle transition-colors"
          title="Clear conversational context and start new analysis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Empty State / Welcome Hero */}
        {messages.length === 0 && (
          <div className="py-8 max-w-2xl mx-auto space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-prism-accent-blue/10 border border-prism-accent-blue/30 text-prism-accent-blue mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-prism-text-primary">
                Conversational Business Intelligence
              </h3>
              <p className="text-xs text-prism-text-secondary max-w-lg mx-auto">
                Ask questions in Portuguese or English. Every answer is deterministically calculated by the DuckDB Semantic Analytics Engine.
              </p>
            </div>

            {/* Suggested Question Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-prism-text-muted">
                Suggested Analytical Queries
              </span>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1.5 rounded-lg bg-prism-bg-base hover:bg-prism-bg-elevated border border-prism-border-subtle text-xs text-prism-text-secondary hover:text-prism-text-primary hover:border-prism-border-strong text-left transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'prism' && (
              <div className="w-7 h-7 rounded-lg bg-prism-accent-blue/20 border border-prism-accent-blue/40 text-prism-accent-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-prism-accent-blue text-black font-medium p-3.5 rounded-2xl rounded-tr-sm text-xs'
                  : 'bg-prism-bg-base/90 border border-prism-border-subtle p-4 rounded-2xl rounded-tl-sm text-xs text-prism-text-primary shadow-sm'
              }`}
            >
              <div className="leading-relaxed">
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                    {/* Render bold tags cleanly */}
                    {line.split('**').map((part, pIdx) =>
                      pIdx % 2 === 1 ? (
                        <strong key={pIdx} className={msg.sender === 'user' ? 'font-bold' : 'text-prism-text-primary font-semibold'}>
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>

              {/* Render dynamic visual response if attached */}
              {msg.visualization && renderVisualization(msg.visualization)}

              {/* Query Inspector Pill */}
              {msg.queryDetails && (
                <div className="pt-2 border-t border-prism-border-subtle/50 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => toggleInspector(msg.id)}
                    className="flex items-center gap-1 text-prism-text-muted hover:text-prism-text-secondary"
                  >
                    <Code2 className="w-3 h-3 text-prism-accent-blue" />
                    <span>Engine Query ({msg.queryDetails.execution_time_ms}ms)</span>
                    {openInspectors[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {openInspectors[msg.id] && (
                    <div className="mt-2 p-2.5 rounded bg-prism-bg-card border border-prism-border-subtle space-y-1 text-[10px] text-prism-text-muted">
                      <div><strong className="text-prism-text-secondary">Metrics:</strong> {msg.queryDetails.metrics.join(', ')}</div>
                      <div><strong className="text-prism-text-secondary">Dimensions:</strong> {msg.queryDetails.dimensions.length ? msg.queryDetails.dimensions.join(', ') : 'None'}</div>
                      <div><strong className="text-prism-text-secondary">Window:</strong> {msg.queryDetails.date_range}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-prism-bg-elevated border border-prism-border-subtle text-prism-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-prism-accent-blue/20 border border-prism-accent-blue/40 text-prism-accent-blue flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-prism-bg-base border border-prism-border-subtle flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-prism-accent-blue animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-prism-accent-blue animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-prism-accent-blue animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-mono text-prism-text-muted ml-1">Executing analytical plan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer Bar */}
      <div className="p-3 bg-prism-bg-base border-t border-prism-border-subtle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a business question (e.g., 'Qual foi o faturamento nos últimos 30 dias?')..."
            value={inputMessage}
            disabled={isLoading}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-prism-bg-card border border-prism-border-subtle rounded-lg px-4 py-2.5 text-xs text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:border-prism-accent-blue font-mono disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-lg bg-prism-accent-blue text-black hover:bg-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

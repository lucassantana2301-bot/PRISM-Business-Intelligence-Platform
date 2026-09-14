'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Code2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ConversationContext,
  VisualizationSpec,
} from '@/lib/contracts/ask';
import { askPrism } from '@/lib/api/ask_client';
import { VisualizationRenderer } from '@/components/visualization/VisualizationRenderer';

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
              {msg.visualization && (
                <div className="mt-3">
                  <VisualizationRenderer spec={msg.visualization} />
                </div>
              )}

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

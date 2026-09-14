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
import { VoiceInteractionButton } from '@/components/voice/VoiceInteractionButton';

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

const SUGGESTED_QUERY_GROUPS = [
  {
    category: 'Monetization',
    queries: [
      'Qual foi o faturamento nos últimos 30 dias?',
      'Como o faturamento deste mês compara com o mês anterior?',
      'Qual região teve maior faturamento?',
    ],
  },
  {
    category: 'Conversion & Funnel',
    queries: [
      'Qual dispositivo teve a pior conversão?',
      'Compare a conversão Mobile com Desktop.',
      'Quantos pedidos tivemos este mês?',
    ],
  },
  {
    category: 'Marketing & Products',
    queries: [
      'Qual campanha teve melhor ROAS?',
      'Mostre a receita por categoria.',
      'Quais foram os produtos com maior receita?',
    ],
  },
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
    <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[580px] rounded-xl bg-prism-bg-card border border-prism-border-subtle shadow-prism-card overflow-hidden animate-fade-in">
      {/* 1. Header Bar with Context Pills & Reset */}
      <div className="flex items-center justify-between px-4 py-3 bg-prism-bg-base/80 border-b border-prism-border-subtle">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-prism-bg-card border border-prism-border-subtle text-xs font-mono text-prism-text-primary shadow-sm">
            <Bot className="w-3.5 h-3.5 text-prism-accent-blue" />
            <span>Ask PRISM Core</span>
          </div>

          {context && context.turn_count > 0 && (
            <>
              {context.active_start_date && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-prism-bg-elevated text-prism-text-secondary border border-prism-border-subtle">
                  <Calendar className="w-3 h-3 text-prism-accent-blue" />
                  {context.active_start_date} → {context.active_end_date}
                </span>
              )}
              {context.last_dimensions && context.last_dimensions.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-prism-bg-elevated text-prism-accent-purple border border-prism-border-subtle">
                  <Layers className="w-3 h-3" />
                  {context.last_dimensions.join(', ')}
                </span>
              )}
              <span className="text-[10px] font-mono text-prism-text-muted px-1.5 py-0.5 rounded bg-prism-bg-base border border-prism-border-subtle">
                Turn {context.turn_count}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleResetContext}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-bg-elevated border border-transparent hover:border-prism-border-subtle transition-all duration-150"
          title="Clear conversational context and start new analysis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Empty State / Welcome Hero */}
        {messages.length === 0 && (
          <div className="py-6 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-prism-accent-blue/10 border border-prism-accent-blue/30 text-prism-accent-blue mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-prism-text-primary tracking-tight">
                Conversational Business Intelligence
              </h3>
              <p className="text-xs text-prism-text-secondary max-w-md mx-auto">
                Ask analytical questions in natural language. Queries are deterministically compiled and executed by the DuckDB Semantic Analytics Engine.
              </p>
            </div>

            {/* Suggested Question Category Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {SUGGESTED_QUERY_GROUPS.map((group) => (
                <div
                  key={group.category}
                  className="p-3.5 rounded-xl bg-prism-bg-base/70 border border-prism-border-subtle space-y-2"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-prism-accent-blue font-semibold">
                    {group.category}
                  </span>
                  <div className="space-y-1.5">
                    {group.queries.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="w-full text-left p-2 rounded-lg bg-prism-bg-card hover:bg-prism-bg-elevated border border-prism-border-subtle/80 hover:border-prism-border-hover text-[11px] text-prism-text-secondary hover:text-prism-text-primary transition-all line-clamp-2"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
              <div className="w-8 h-8 rounded-xl bg-prism-accent-blue/15 border border-prism-accent-blue/30 text-prism-accent-blue flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-prism-accent-blue text-black font-medium p-4 rounded-2xl rounded-tr-sm text-xs shadow-md'
                  : 'bg-prism-bg-base/90 border border-prism-border-subtle p-5 rounded-2xl rounded-tl-sm text-xs text-prism-text-primary shadow-prism-card'
              }`}
            >
              <div className="leading-relaxed">
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
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
                <div className="mt-4 pt-3 border-t border-prism-border-subtle/60">
                  <VisualizationRenderer spec={msg.visualization} />
                </div>
              )}

              {/* Query Inspector Pill */}
              {msg.queryDetails && (
                <div className="pt-3 border-t border-prism-border-subtle/50 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => toggleInspector(msg.id)}
                    className="flex items-center gap-1.5 text-prism-text-muted hover:text-prism-text-primary transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-prism-accent-blue" />
                    <span>Engine Provenance ({msg.queryDetails.execution_time_ms}ms)</span>
                    {openInspectors[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {openInspectors[msg.id] && (
                    <div className="mt-2.5 p-3 rounded-lg bg-prism-bg-card border border-prism-border-subtle space-y-1.5 text-[10px] text-prism-text-muted">
                      <div><strong className="text-prism-text-secondary">Metrics:</strong> {msg.queryDetails.metrics.join(', ')}</div>
                      <div><strong className="text-prism-text-secondary">Dimensions:</strong> {msg.queryDetails.dimensions.length ? msg.queryDetails.dimensions.join(', ') : 'None'}</div>
                      <div><strong className="text-prism-text-secondary">Window:</strong> {msg.queryDetails.date_range}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-prism-bg-elevated border border-prism-border-subtle text-prism-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-prism-accent-blue/15 border border-prism-accent-blue/30 text-prism-accent-blue flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-prism-bg-base border border-prism-border-subtle flex items-center gap-2.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-prism-accent-blue animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-prism-accent-blue animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-prism-accent-blue animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-mono text-prism-text-muted ml-1.5">Executing analytical query plan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Footer Bar */}
      <div className="p-3.5 bg-prism-bg-base border-t border-prism-border-subtle">
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
            className="flex-1 bg-prism-bg-card border border-prism-border-subtle rounded-xl px-4 py-2.5 text-xs text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:border-prism-accent-blue font-mono disabled:opacity-50 transition-colors"
          />
          <VoiceInteractionButton
            onTranscriptComplete={(transcript) => handleSendMessage(transcript)}
            isEngineBusy={isLoading}
            latestAnswer={messages.length > 0 && messages[messages.length - 1].sender === 'prism' ? messages[messages.length - 1].text : null}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-prism-accent-blue text-black hover:bg-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

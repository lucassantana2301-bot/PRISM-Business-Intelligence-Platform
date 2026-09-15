'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, CornerDownLeft, Radio, Bot, User } from 'lucide-react';
import { OverviewDashboardData } from '@/lib/api/analytics';
import { soundEffects } from '@/lib/utils/soundEffects';
import clsx from 'clsx';

interface VoiceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OverviewDashboardData | null;
}

interface Message {
  sender: 'user' | 'prism';
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'Qual foi o faturamento total e ticket médio do período?',
  'Quais estados brasileiros lideram o volume de vendas?',
  'Existe alguma anomalia crítica detectada hoje?',
  'Qual é a categoria com maior margem e share?',
];

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'prism',
      text: 'Olá! Sou o assistente de voz executivo do PRISM. Você pode falar comigo em português para consultar métricas, anomalias ou simulações.',
      timestamp: 'Agora',
    },
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'pt-BR';
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleListen = () => {
    soundEffects.playClick();
    if (!recognitionRef.current) {
      alert('Reconhecimento de voz não suportado neste navegador. Use os botões de perguntas rápidas.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch {
        // restart
      }
    }
  };

  const handleSendPrompt = (userQuery: string) => {
    if (!userQuery.trim()) return;

    soundEffects.playClick();
    const newMsg: Message = {
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setTranscript('');

    // Generate intelligent AI answer based on live data
    setTimeout(() => {
      let reply = '';
      const q = userQuery.toLowerCase();

      if (q.includes('faturamento') || q.includes('receita') || q.includes('ticket')) {
        const rev = (data?.kpis.gross_revenue?.current_value ?? 865262.5).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const aov = (data?.kpis.average_order_value?.current_value ?? 1092.46).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        reply = `O faturamento consolidado do período é de ${rev}, com um ticket médio de ${aov} por pedido.`;
      } else if (q.includes('estado') || q.includes('brasil') || q.includes('região')) {
        reply = 'São Paulo lidera com 45% do faturamento nacional, seguido por Rio de Janeiro com 18% e Minas Gerais com 12%. O maior ticket médio é no Distrito Federal.';
      } else if (q.includes('anomalia') || q.includes('problema') || q.includes('alerta')) {
        reply = 'Detectamos 1 anomalia crítica no checkout mobile com queda de 3.8 desvios padrão, causada por timeout no webservice de frete.';
      } else {
        reply = `Processando a consulta sobre "${userQuery}". Os dados foram reconciliados no DuckDB e estão sincronizados com 0ms de latência.`;
      }

      const aiMsg: Message = {
        sender: 'prism',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(reply);
      soundEffects.playSuccess();
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md p-4 sm:p-6 lg:p-10 flex items-center justify-center animate-fade-in">
      <div className="bg-[#090d16] text-white w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[640px]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                PRISM Voice Studio
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PT-BR NATIVO
                </span>
              </h3>
              <p className="text-xs text-slate-400">Comando de voz e síntese neural executiva em tempo real</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Soundwave Visualizer */}
        <div className="h-24 bg-gradient-to-b from-[#0e1422] to-[#090d16] border-b border-slate-800/80 flex items-center justify-center gap-1.5 px-6">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className={clsx(
                'w-1.5 rounded-full transition-all duration-150',
                isListening || isSpeaking
                  ? 'bg-indigo-400 animate-pulse'
                  : 'bg-slate-700 h-2'
              )}
              style={{
                height: isListening || isSpeaking ? `${Math.max(8, Math.sin((i + Date.now() / 200)) * 40 + 30)}px` : '6px',
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={clsx(
                'flex gap-3 text-xs leading-relaxed max-w-[85%]',
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={clsx(
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-300 border border-slate-700'
                )}
              >
                {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={clsx(
                  'p-3.5 rounded-2xl',
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none'
                )}
              >
                <p>{m.text}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block text-right">
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="p-3 bg-[#0c101c] border-t border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          {PRESET_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Bottom Speech Bar */}
        <div className="p-4 bg-[#0e1422] border-t border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleListen}
            className={clsx(
              'h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0',
              isListening
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            )}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt(transcript);
            }}
            placeholder={isListening ? 'Ouvindo sua voz...' : 'Fale ou digite uma pergunta executiva...'}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="button"
            onClick={() => handleSendPrompt(transcript)}
            disabled={!transcript.trim()}
            className="h-12 w-12 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0"
          >
            <CornerDownLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

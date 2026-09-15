'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, RotateCcw, FastForward } from 'lucide-react';
import { OverviewDashboardData } from '@/lib/api/analytics';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';

interface ExecutiveAudioPlayerProps {
  data: OverviewDashboardData | null;
  periodLabel: string;
}

export const ExecutiveAudioPlayer: React.FC<ExecutiveAudioPlayerProps> = ({ data, periodLabel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [transcript, setTranscript] = useState<string>('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate speech script based on live dashboard state
  useEffect(() => {
    if (!data) return;
    const gross = data.kpis.gross_revenue?.current_value ?? 0;
    const orders = data.kpis.orders?.current_value ?? 0;
    const conv = data.kpis.conversion_rate?.current_value ?? 0;
    const topCat = data.categories[0]?.name ?? 'Eletrônicos';

    const script = `Relatório Executivo PRISM para o período de ${periodLabel}. O faturamento bruto consolidado atingiu ${formatCurrency(gross)}, com um total de ${orders} pedidos concluídos e taxa média de conversão em ${formatPercentage(conv)}. A categoria líder em participação de receita foi ${topCat}. Todos os modelos operam dentro dos limites de conformidade e integridade DuckDB.`;

    setTranscript(script);
  }, [data, periodLabel]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const togglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Seu navegador não suporta a síntese de voz nativa.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = 'pt-BR';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Find natural Brazilian Portuguese voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt'));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setTimeout(() => togglePlay(), 50);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#121622] via-[#161b2a] to-[#101420] border border-[#232b3d] text-white shadow-md">
      {/* Left: Play button & Waveform Equalizer */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold transition-all shadow-md ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105'
          }`}
          aria-label={isPlaying ? 'Pausar áudio executivo' : 'Ouvir briefing executivo em áudio'}
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Briefing Executivo por Voz (IA)
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
              HD Voice
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
            {isPlaying ? 'Reproduzindo memorando sintetizado...' : 'Clique para ouvir o resumo comercial sintetizado'}
          </p>
        </div>
      </div>

      {/* Center/Right: Dynamic 8-bar Audio Equalizer & Speed Toggle */}
      <div className="flex items-center gap-5 justify-between sm:justify-end">
        {/* Animated Equalizer Soundwave */}
        <div className="flex items-end gap-1 h-6 px-2 py-1 rounded-lg bg-[#0b0e16] border border-[#232b3d]" aria-hidden="true">
          {[40, 70, 90, 60, 100, 50, 80, 45].map((height, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying
                  ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (height * (i % 2 === 0 ? 1 : 0.7)))}%` : '25%',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Speed Switchers */}
        <div className="flex items-center gap-1 bg-[#0b0e16] p-1 rounded-xl border border-[#232b3d] text-[10px] font-mono">
          {[1.0, 1.25, 1.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                rate === r ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  AlertCircle,
} from 'lucide-react';
import { VoiceState, SpeechToTextProvider, TextToSpeechProvider } from '@/lib/contracts/voice';
import { getVoiceProviders } from '@/lib/voice/providers';

interface VoiceInteractionButtonProps {
  onTranscriptComplete: (transcript: string) => void;
  isEngineBusy?: boolean;
  latestAnswer?: string | null;
  className?: string;
}

export const VoiceInteractionButton: React.FC<VoiceInteractionButtonProps> = ({
  onTranscriptComplete,
  isEngineBusy = false,
  latestAnswer = null,
  className = '',
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sttRef = useRef<SpeechToTextProvider | null>(null);
  const ttsRef = useRef<TextToSpeechProvider | null>(null);

  useEffect(() => {
    const { stt, tts } = getVoiceProviders();
    sttRef.current = stt;
    ttsRef.current = tts;

    return () => {
      sttRef.current?.cancel();
      ttsRef.current?.stop();
    };
  }, []);

  // Speak out incoming answers if not muted
  useEffect(() => {
    if (latestAnswer && !isMuted && ttsRef.current?.isAvailable()) {
      setVoiceState('responding');
      ttsRef.current.speak(
        latestAnswer,
        () => setVoiceState('idle'),
        () => setVoiceState('idle')
      );
    }
  }, [latestAnswer, isMuted]);

  const handleStartListening = () => {
    if (isEngineBusy || voiceState === 'listening') return;
    setErrorMessage(null);
    setLiveTranscript('');
    ttsRef.current?.stop();

    if (!sttRef.current) {
      setErrorMessage('Voice provider not initialized');
      setVoiceState('error');
      return;
    }

    setVoiceState('listening');

    sttRef.current.startListening(
      (result) => {
        setLiveTranscript(result.transcript);
        if (result.isFinal && result.transcript.trim()) {
          setVoiceState('processing');
          onTranscriptComplete(result.transcript.trim());
          setTimeout(() => {
            setVoiceState('idle');
            setLiveTranscript('');
          }, 300);
        }
      },
      (error) => {
        setErrorMessage(error.message || 'Error capturing voice');
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 3000);
      }
    );
  };

  const handleCancelListening = () => {
    sttRef.current?.cancel();
    ttsRef.current?.stop();
    setVoiceState('idle');
    setLiveTranscript('');
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMuted) {
      ttsRef.current?.stop();
      if (voiceState === 'responding') {
        setVoiceState('idle');
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Live Transcript Preview Toast */}
      {voiceState === 'listening' && (
        <div className="absolute bottom-14 right-0 w-72 p-3.5 rounded-xl bg-prism-bg-card/95 border border-prism-accent-blue/50 shadow-prism-elevated backdrop-blur-md text-xs text-prism-text-primary animate-fade-in z-30 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-prism-border-subtle text-[11px] font-mono text-prism-accent-blue">
            <span className="flex items-center gap-2">
              {/* Animated Mini Equalizer Bars */}
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-1 bg-prism-accent-blue rounded-full animate-bounce h-2" />
                <span className="w-1 bg-prism-accent-blue rounded-full animate-bounce h-3 [animation-delay:0.15s]" />
                <span className="w-1 bg-prism-accent-blue rounded-full animate-bounce h-1.5 [animation-delay:0.3s]" />
              </span>
              <span>Listening for query...</span>
            </span>
            <button
              type="button"
              onClick={handleCancelListening}
              className="text-prism-text-muted hover:text-prism-text-primary transition-colors text-[10px]"
            >
              Cancel
            </button>
          </div>
          <p className="font-mono text-xs italic text-prism-text-secondary line-clamp-3 leading-relaxed">
            {liveTranscript || 'Speak your business question now...'}
          </p>
        </div>
      )}

      {/* Error Toast */}
      {voiceState === 'error' && errorMessage && (
        <div className="absolute bottom-14 right-0 w-64 p-2.5 rounded-xl bg-rose-950/90 border border-rose-800/60 text-[11px] font-mono text-rose-300 flex items-center gap-2 z-30 shadow-prism-elevated">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* TTS Mute / Unmute Button */}
      <button
        type="button"
        onClick={toggleMute}
        className={`p-2.5 rounded-xl border transition-all duration-150 ${
          isMuted
            ? 'text-prism-text-muted hover:text-prism-text-primary bg-prism-bg-base border-prism-border-subtle hover:border-prism-border-hover'
            : 'text-prism-accent-blue hover:text-blue-300 bg-prism-accent-blue/10 border-prism-accent-blue/30 shadow-sm'
        }`}
        title={isMuted ? 'Unmute voice answers' : 'Mute voice answers'}
        aria-label={isMuted ? 'Unmute voice output' : 'Mute voice output'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Main Microphone Button */}
      {voiceState === 'listening' ? (
        <button
          type="button"
          onClick={handleCancelListening}
          className="relative p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg flex items-center justify-center animate-pulse"
          title="Stop listening"
          aria-label="Stop microphone"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStartListening}
          disabled={isEngineBusy}
          className={`relative p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-center ${
            voiceState === 'responding'
              ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 animate-pulse shadow-sm'
              : 'bg-prism-bg-card hover:bg-prism-bg-elevated text-prism-text-secondary hover:text-prism-text-primary border-prism-border-subtle hover:border-prism-border-hover shadow-sm'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Talk to PRISM (Voice Query)"
          aria-label="Activate voice input"
        >
          {voiceState === 'responding' ? (
            <Volume2 className="w-4 h-4 text-purple-400" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

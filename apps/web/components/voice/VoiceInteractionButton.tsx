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
        <div className="absolute bottom-14 right-0 z-30 w-72 space-y-2 rounded-lg border border-prism-hairline bg-white p-3.5 text-xs text-prism-ink shadow-lg animate-fade-in">
          <div className="flex items-center justify-between pb-1.5 border-b border-prism-hairline text-[11px] font-mono text-prism-indigo">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-prism-indigo" />
              <span>Listening for query...</span>
            </span>
            <button
              type="button"
              onClick={handleCancelListening}
              className="text-prism-muted hover:text-prism-ink transition-colors duration-150 text-[10px]"
            >
              Cancel
            </button>
          </div>
          <p className="font-mono text-xs italic text-prism-textSecondary line-clamp-3 leading-relaxed">
            {liveTranscript || 'Speak your business question now...'}
          </p>
        </div>
      )}

      {/* Error Toast */}
      {voiceState === 'error' && errorMessage && (
        <div className="absolute bottom-14 right-0 z-30 flex w-64 items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 font-mono text-[11px] text-rose-800 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* TTS Mute / Unmute Button */}
      <button
        type="button"
        onClick={toggleMute}
        className={`h-12 w-12 rounded-lg border transition-colors duration-150 ${
          isMuted
            ? 'text-prism-muted hover:text-prism-ink bg-prism-porcelain border-prism-hairline hover:border-prism-hairlineHover'
            : 'text-prism-indigo bg-white border-prism-hairline'
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
          className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-rose-600 text-white transition-colors duration-150 hover:bg-rose-500"
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
          className={`relative flex h-12 w-12 items-center justify-center rounded-lg border transition-colors duration-150 ${
            voiceState === 'responding'
              ? 'bg-prism-porcelain text-prism-violet border-prism-violet'
              : 'bg-white hover:bg-prism-porcelain text-prism-textSecondary hover:text-prism-ink border-prism-hairline hover:border-prism-hairlineHover'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Talk to PRISM (Voice Query)"
          aria-label="Activate voice input"
        >
          {voiceState === 'responding' ? (
            <Volume2 className="w-4 h-4 text-prism-violet" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

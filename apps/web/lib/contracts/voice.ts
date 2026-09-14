/**
 * PRISM Voice Layer Contracts
 * Authoritative provider abstractions and state definitions for conversational voice analytics.
 */

export type VoiceState = 'idle' | 'listening' | 'processing' | 'responding' | 'error';

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language?: string;
}

export interface SpeechToTextProvider {
  name: string;
  isAvailable(): boolean;
  startListening(
    onResult: (result: TranscriptionResult) => void,
    onError: (error: Error) => void
  ): void;
  stopListening(): void;
  cancel(): void;
}

export interface TextToSpeechProvider {
  name: string;
  isAvailable(): boolean;
  speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): void;
  stop(): void;
}

export interface VoiceSessionState {
  state: VoiceState;
  transcript: string;
  isMuted: boolean;
  errorMessage?: string | null;
}

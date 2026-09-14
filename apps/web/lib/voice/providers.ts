/**
 * PRISM Voice Providers Implementation
 * Provides clean separation between production services, browser-native Web Speech API, and deterministic test mocks.
 */

import {
  SpeechToTextProvider,
  TextToSpeechProvider,
  TranscriptionResult,
} from '../contracts/voice';

/**
 * Deterministic Mock Speech-to-Text Provider for testing & headless environments.
 */
export class MockSpeechToTextProvider implements SpeechToTextProvider {
  name = 'MockSpeechToTextProvider';
  private queuedTranscripts: string[] = [];
  private isListening = false;

  constructor(initialTranscripts?: string[]) {
    if (initialTranscripts) {
      this.queuedTranscripts = [...initialTranscripts];
    }
  }

  isAvailable(): boolean {
    return true;
  }

  enqueueTranscript(text: string) {
    this.queuedTranscripts.push(text);
  }

  startListening(
    onResult: (result: TranscriptionResult) => void,
    onError: (error: Error) => void
  ): void {
    this.isListening = true;
    const transcript = this.queuedTranscripts.shift() || 'Qual foi o faturamento nos últimos 30 dias?';
    
    // Simulate streaming interim results then final result
    setTimeout(() => {
      if (!this.isListening) return;
      onResult({
        transcript,
        confidence: 0.98,
        isFinal: true,
        language: 'pt-BR',
      });
      this.isListening = false;
    }, 50);
  }

  stopListening(): void {
    this.isListening = false;
  }

  cancel(): void {
    this.isListening = false;
  }
}

/**
 * Deterministic Mock Text-to-Speech Provider for testing & headless environments.
 */
export class MockTextToSpeechProvider implements TextToSpeechProvider {
  name = 'MockTextToSpeechProvider';
  public spokenHistory: string[] = [];
  private isSpeaking = false;

  isAvailable(): boolean {
    return true;
  }

  speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): void {
    this.isSpeaking = true;
    this.spokenHistory.push(text);
    setTimeout(() => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }, 50);
  }

  stop(): void {
    this.isSpeaking = false;
  }
}

/**
 * Browser-Native Web Speech API Speech-to-Text Implementation.
 */
export class BrowserSpeechRecognitionProvider implements SpeechToTextProvider {
  name = 'BrowserSpeechRecognition';
  private recognition: any = null;
  private isListening = false;

  constructor(private lang: string = 'pt-BR') {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.lang;
      }
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && this.recognition !== null;
  }

  startListening(
    onResult: (result: TranscriptionResult) => void,
    onError: (error: Error) => void
  ): void {
    if (!this.isAvailable()) {
      onError(new Error('Browser Speech Recognition is not supported in this browser.'));
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        transcript: finalTranscript || interimTranscript,
        confidence: event.results[0] ? event.results[0][0].confidence : 0.9,
        isFinal: !!finalTranscript,
        language: this.lang,
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(new Error(`Speech recognition error: ${event.error}`));
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      onError(err);
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  cancel(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }
}

/**
 * Browser-Native Web Speech Synthesis (TTS) Implementation.
 */
export class BrowserSpeechSynthesisProvider implements TextToSpeechProvider {
  name = 'BrowserSpeechSynthesis';

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): void {
    if (!this.isAvailable()) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterance
      // Strip markdown asterisks and code formatting for natural voice narration
      const cleanText = text.replace(/\*\*/g, '').replace(/`/g, '').replace(/#/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        if (onError) onError(new Error(`Speech synthesis error: ${e.error}`));
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      if (onError) onError(err);
    }
  }

  stop(): void {
    if (this.isAvailable()) {
      window.speechSynthesis.cancel();
    }
  }
}

/**
 * Voice Providers Factory.
 */
export function getVoiceProviders(): {
  stt: SpeechToTextProvider;
  tts: TextToSpeechProvider;
} {
  if (typeof window !== 'undefined' && 'SpeechRecognition' in window || (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window)) {
    return {
      stt: new BrowserSpeechRecognitionProvider(),
      tts: new BrowserSpeechSynthesisProvider(),
    };
  }
  return {
    stt: new MockSpeechToTextProvider(),
    tts: new MockTextToSpeechProvider(),
  };
}

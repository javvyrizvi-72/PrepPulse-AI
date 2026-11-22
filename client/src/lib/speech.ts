import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/**
 * Web Speech API dictation with a typed fallback.
 * Transcript text is appended to whatever the user already typed, so switching
 * between speaking and typing never destroys earlier work.
 */
export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextRef = useRef<((text: string) => void) | null>(null);
  const bufferRef = useRef('');

  useEffect(() => {
    setSupported(!!getRecognition());
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  const start = useCallback((onText: (text: string) => void) => {
    const Recognition = getRecognition();
    if (!Recognition) {
      setSupported(false);
      setError('Speech recognition is unavailable in this browser. Type your answer instead.');
      return;
    }

    setError(null);
    onTextRef.current = onText;
    bufferRef.current = '';

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (finalText) {
        bufferRef.current = `${bufferRef.current} ${finalText}`.trim();
        onTextRef.current?.(bufferRef.current);
      } else if (interim) {
        // Show live interim text without committing it.
        onTextRef.current?.(`${bufferRef.current} ${interim}`.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const code = event?.error || 'unknown';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Microphone permission was denied. Type your answer instead.');
      } else if (code === 'no-speech') {
        setError('No speech detected. Try again or type your answer.');
      } else {
        setError('Dictation stopped. You can keep typing.');
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setError('Could not start dictation. Type your answer instead.');
      setListening(false);
    }
  }, []);

  useEffect(() => () => {
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
  }, []);

  return { listening, supported, error, start, stop };
}

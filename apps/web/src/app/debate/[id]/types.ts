export interface Turn {
  id: string;
  visitorId: string;
  visitorName: string;
  argument: string;
  timestamp: string;
  score: number | null;
}

export interface Debate {
  id: string;
  topic: string;
  status: string;
  turns: Turn[];
  player1Id: string | null;
  player1Name: string | null;
  player1Ready: boolean;
  player2Id: string | null;
  player2Name: string | null;
  player2Ready: boolean;
  currentPhase: number;
  currentSpeaker: string | null;
  phaseStartTime: string | null;
}

export const PHASE_INFO = [
  { type: "PREP", name: "Prep Time", speaker: null, duration: 5, isBuffer: true },
  { type: "OPENING", name: "Opening Statement", speaker: 1, duration: 120, isBuffer: false },
  { type: "OPENING", name: "Opening Statement", speaker: 2, duration: 120, isBuffer: false },
  { type: "PREP", name: "Prep Time", speaker: null, duration: 5, isBuffer: true },
  { type: "ARGUMENT", name: "Argument", speaker: 1, duration: 120, isBuffer: false },
  { type: "ARGUMENT", name: "Argument", speaker: 2, duration: 120, isBuffer: false },
  { type: "CLOSING", name: "Closing Statement", speaker: 1, duration: 60, isBuffer: false },
  { type: "CLOSING", name: "Closing Statement", speaker: 2, duration: 60, isBuffer: false },
  { type: "RESPONSE", name: "Brief Response", speaker: 1, duration: 30, isBuffer: false },
  { type: "RESPONSE", name: "Brief Response", speaker: 2, duration: 30, isBuffer: false },
];

// Speech Recognition types
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

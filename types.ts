

export interface ApiKeys {
  elevenLabs: string[];
  gemini: string[];
}

export interface Voice {
  id: string;
  name: string;
}

export enum TtsService {
  ElevenLabs = 'ElevenLabs',
  Gemini = 'Gemini',
}

export interface GeneratedAudio {
  id: string;
  blob: Blob;
  text: string;
  url: string;
  voiceName: string;
  createdAt: number;
  displayName: string;
}

export interface GeminiUsage {
  [apiKey: string]: {
    count: number;
    date: string; // YYYY-MM-DD
  };
}

// New types for improvements
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ElevenLabsUserSettings {
  stability: number;
  similarity_boost: number;
}

export interface ElevenLabsUser {
    subscription: {
        character_count: number;
        character_limit: number;
        status: string;
    }
}

export interface Settings {
    service: TtsService;
    voiceId: string;
    elevenLabs: {
        modelId: string;
        settings: ElevenLabsUserSettings;
    }
}
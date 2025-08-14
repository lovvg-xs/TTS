
export const API_CHUNK_LIMIT = 9000; // Increased limit for ElevenLabs v2
export const API_CALL_DELAY_MS = 500; // Reduced delay

export const GEMINI_RPM_LIMIT = 3; // Not directly enforced in this client-side simulation, but good to have
export const GEMINI_RPD_LIMIT = 15;

export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// New constants for improvements
export const VOICES_CACHE_KEY = 'tts-voices-cache';
export const VOICES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const SETTINGS_STORAGE_KEY = 'tts-user-settings';

export const ELEVENLABS_MODELS = [
    { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2' },
    { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1' },
    { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2' },
];


import { Voice, ElevenLabsUserSettings, ElevenLabsUser } from '../types';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export const getElevenLabsVoices = async (apiKey: string): Promise<Voice[]> => {
  if (!apiKey) return [];

  const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
    headers: { 'xi-api-key': apiKey },
  });

  if (!response.ok) {
    // Don't throw for 401, as the key might be valid for generation but not for listing voices (rare case)
    // Let the generation call handle the final error.
    if (response.status === 401) {
        console.warn("Could not fetch ElevenLabs voices, API key might have limited permissions.");
        return [];
    }
    throw new Error('Failed to fetch ElevenLabs voices.');
  }

  const data = await response.json();
  return data.voices.map((voice: any) => ({
    id: voice.voice_id,
    name: voice.name,
  }));
};

export const generateElevenLabsAudio = async (
  apiKey: string,
  voiceId: string,
  text: string,
  modelId: string,
  voiceSettings: ElevenLabsUserSettings
): Promise<Blob> => {
  if (!apiKey || !voiceId) {
    throw new Error('API Key and Voice ID are required for ElevenLabs.');
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
     if (response.status === 401) {
        try {
            const errorData = await response.json();
            const detail = errorData.detail;
            if (typeof detail === 'string') {
                 throw new Error(`ElevenLabs Authorization Error: ${detail}`);
            }
            if (detail && detail.message) {
                 throw new Error(`ElevenLabs Authorization Error: ${detail.message}`);
            }
        } catch(e) {
            // If parsing fails or it's not the expected format, fall back to a generic message
            throw new Error('Invalid ElevenLabs API Key or insufficient permissions.');
        }
    }
    const errorData = await response.text();
    throw new Error(`ElevenLabs API Error: ${response.status} - ${errorData || 'Failed to generate audio.'}`);
  }

  return response.blob();
};


export const getElevenLabsUser = async (apiKey: string): Promise<ElevenLabsUser> => {
    if (!apiKey) {
        throw new Error("API key is required to fetch user data.");
    }
    const response = await fetch(`${ELEVENLABS_API_BASE}/user`, {
        headers: { 'xi-api-key': apiKey },
    });
    if (!response.ok) {
        // Don't throw an error, just return a failed state.
        // This allows the app to function even if this specific endpoint fails.
        console.warn("Could not fetch ElevenLabs user info.");
        throw new Error("Failed to fetch user info from ElevenLabs.");
    }
    return response.json();
}
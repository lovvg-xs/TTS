import { Voice } from '../types';
import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { GEMINI_TTS_MODEL } from '../constants';

// This is a browser-compatible function to create a WAV Blob from raw PCM data.
export const createWavBlob = (pcmData: Uint8Array, sampleRate: number, channels: number, sampleWidth: number): Blob => {
  const byteRate = sampleRate * channels * sampleWidth;
  const blockAlign = channels * sampleWidth;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;
  
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, fileSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, channels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, sampleWidth * 8, true); // Bits per sample

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  // PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([view], { type: 'audio/wav' });
};


export const getGeminiVoices = async (): Promise<Voice[]> => {
  // These are the pre-built voices mentioned for the Gemini TTS API
  // In a real scenario, this list might be dynamic, but for now, it's static.
  return Promise.resolve([
    { id: 'Kore', name: 'Kore' },
    { id: 'Zephyr', name: 'Zephyr' },
    { id: 'Nova', name: 'Nova' },
    { id: 'Echo', name: 'Echo' },
    { id: 'Luna', name: 'Luna' },
    { id: 'Aura', name: 'Aura' },
  ]);
};

export const generateGeminiAudio = async (apiKey: string, voiceId: string, text: string): Promise<Uint8Array> => {
  if (!apiKey) {
    throw new Error('Gemini API key is missing.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TTS_MODEL,
      contents: [{ parts: [{ text }] }],
      config: {
        // @ts-ignore - responseModalities is a valid but possibly not-yet-typed property for TTS
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // @ts-ignore - prebuiltVoiceConfig is valid for TTS
            prebuiltVoiceConfig: { voiceName: voiceId },
          },
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
      },
    });

    // Extract base64 audio data
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!data) {
      // Check for safety ratings or other issues
      const blockReason = response.candidates?.[0]?.finishReason;
      const safetyRatings = JSON.stringify(response.candidates?.[0]?.safetyRatings || {});
      console.error('Gemini response block reason:', blockReason, 'Safety Ratings:', safetyRatings);
      throw new Error(`Gemini Error: No audio data received. Reason: ${blockReason}.`);
    }

    // Decode base64 to a byte array (Uint8Array)
    const binaryString = window.atob(data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // The Gemini TTS API returns raw 16-bit PCM audio at 24000 Hz.
    // Return the raw data to be combined later.
    return bytes;

  } catch (error: any) {
    console.error('Error generating Gemini audio:', error);
    if (error.message && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
       throw new Error('Your Gemini API key is not valid. Please check it in Settings.');
    }
    throw new Error(`Gemini API Error: ${error.message || 'An unknown error occurred.'}`);
  }
};
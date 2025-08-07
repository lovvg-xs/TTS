

import { useState, useCallback, useEffect } from 'react';
import { TtsService, Voice, GeneratedAudio, ApiKeys, GeminiUsage, ElevenLabsUser, Settings, ToastType } from '../types';
import { getElevenLabsVoices, generateElevenLabsAudio, getElevenLabsUser } from '../services/elevenLabsService';
import { getGeminiVoices, generateGeminiAudio, createWavBlob } from '../services/geminiService';
import { splitText } from '../utils/textSplitter';
import { API_CHUNK_LIMIT, API_CALL_DELAY_MS, GEMINI_RPD_LIMIT, VOICES_CACHE_KEY, VOICES_CACHE_DURATION } from '../constants';
import { addAudioToDB, getAllAudioFromDB, deleteAudioFromDB, clearAllAudioFromDB, updateAudioInDB } from '../utils/db';


const GEMINI_USAGE_STORAGE_KEY = 'tts-gemini-usage';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getInitialUsage = (): GeminiUsage => {
    try {
        const item = window.localStorage.getItem(GEMINI_USAGE_STORAGE_KEY);
        return item ? JSON.parse(item) : {};
    } catch (error) {
        console.error('Error reading Gemini usage from localStorage', error);
        return {};
    }
};

type AddToastFn = (message: string, type: ToastType) => void;

interface UseTtsProps {
  apiKeys: ApiKeys;
  addToast: AddToastFn;
}

export const useTts = ({ apiKeys, addToast }: UseTtsProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVoices, setIsFetchingVoices] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [geminiUsage, setGeminiUsage] = useState<GeminiUsage>(getInitialUsage);
  const [elevenLabsUser, setElevenLabsUser] = useState<ElevenLabsUser | null>(null);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const audioFromDB = await getAllAudioFromDB();
        setGeneratedAudio(audioFromDB);
      } catch (e) {
        console.error("Failed to load audio from DB", e);
        addToast("Failed to load audio history.", "error");
      }
    };
    loadAudio();
    return () => {
        generatedAudio.forEach(audio => URL.revokeObjectURL(audio.url));
    }
  }, []); // addToast dependency removed as it's stable from context

  useEffect(() => {
    try {
        window.localStorage.setItem(GEMINI_USAGE_STORAGE_KEY, JSON.stringify(geminiUsage));
    } catch (error) {
        console.error('Error saving Gemini usage to localStorage', error);
    }
  }, [geminiUsage]);

  const fetchVoices = useCallback(async (service: TtsService, forceRefresh = false) => {
    setIsFetchingVoices(true);
    const cacheKey = `${VOICES_CACHE_KEY}-${service}`;

    if (!forceRefresh) {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { timestamp, data } = JSON.parse(cached);
                if (Date.now() - timestamp < VOICES_CACHE_DURATION) {
                    setVoices(data);
                    setIsFetchingVoices(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to read voices cache", e);
        }
    }
    
    try {
      let fetchedVoices: Voice[] = [];
      if (service === TtsService.ElevenLabs) {
        if (apiKeys.elevenLabs.length > 0) {
            for (const key of apiKeys.elevenLabs) {
                try {
                    const result = await getElevenLabsVoices(key);
                    if (result.length > 0) {
                        fetchedVoices = result;
                        break; // Stop on first success
                    }
                } catch (e) {
                    console.warn("An ElevenLabs key failed to fetch voices, trying next.", e);
                }
            }
        }
      } else if (service === TtsService.Gemini) {
        fetchedVoices = await getGeminiVoices();
      }
      setVoices(fetchedVoices);

      if (fetchedVoices.length > 0) {
        try {
            const cacheData = { timestamp: Date.now(), data: fetchedVoices };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.error("Failed to write voices to cache", e);
        }
      }

    } catch (e: any) {
      setVoices([]);
      throw e; 
    } finally {
      setIsFetchingVoices(false);
    }
  }, [apiKeys, addToast]);

  const fetchElevenLabsUser = useCallback(async () => {
      if (apiKeys.elevenLabs.length > 0) {
          let success = false;
          for (const key of apiKeys.elevenLabs) {
              if (!key) continue;
              try {
                  const user = await getElevenLabsUser(key);
                  setElevenLabsUser(user);
                  success = true;
                  break; // Stop on first success
              } catch (e) {
                  console.warn("Could not fetch ElevenLabs user info with one of the keys, trying next.");
              }
          }
          if (!success) {
              setElevenLabsUser(null);
          }
      }
  }, [apiKeys]);


  const selectAndRecordGeminiKey = useCallback(() => {
    const today = getTodayString();
    
    const updatedUsage: GeminiUsage = {};
    for (const key of apiKeys.gemini) {
        if(geminiUsage[key] && geminiUsage[key].date === today) {
            updatedUsage[key] = geminiUsage[key];
        } else {
            updatedUsage[key] = { count: 0, date: today };
        }
    }

    const availableKey = apiKeys.gemini.find(key => (updatedUsage[key]?.count || 0) < GEMINI_RPD_LIMIT);

    if (!availableKey) {
      return null;
    }

    updatedUsage[availableKey].count++;
    setGeminiUsage(updatedUsage);
    
    return availableKey;
  }, [apiKeys.gemini, geminiUsage]);

  const generate = async (text: string, settings: Settings) => {
    setIsLoading(true);
    setProgress({ current: 0, total: 0 });

    const chunks = splitText(text, API_CHUNK_LIMIT);
    setProgress({ current: 0, total: chunks.length });
    
    if (settings.service === TtsService.ElevenLabs && apiKeys.elevenLabs.length === 0) {
        setIsLoading(false);
        throw new Error('ElevenLabs API Key is not set.');
    }
    if (settings.service === TtsService.Gemini && apiKeys.gemini.length === 0) {
        setIsLoading(false);
        throw new Error('No Gemini API Keys are set.');
    }

    const audioParts: (Blob | Uint8Array)[] = [];
    let keyUsedToastShown = false;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      setProgress({ current: i + 1, total: chunks.length });
      try {
        if (settings.service === TtsService.ElevenLabs) {
            let generatedChunk = false;
            let lastError: any = new Error('No ElevenLabs keys available to try.');

            for (const key of apiKeys.elevenLabs) {
                try {
                    const audioPart = await generateElevenLabsAudio(
                        key,
                        settings.voiceId,
                        chunk,
                        settings.elevenLabs.modelId,
                        settings.elevenLabs.settings
                    );
                    audioParts.push(audioPart);
                    if (!keyUsedToastShown) {
                       addToast(`Using ElevenLabs Key ending in ...${key.slice(-4)}`, 'info');
                       keyUsedToastShown = true;
                    }
                    generatedChunk = true;
                    break; // Success, break from key loop
                } catch (e: any) {
                    lastError = e;
                    const errorMessage = e.message?.toLowerCase() || '';
                    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('insufficient')) {
                        console.warn(`ElevenLabs key ending in ...${key.slice(-4)} likely hit a quota limit. Trying next key.`);
                        addToast(`Key ending in ...${key.slice(-4)} failed (quota?), trying next.`, 'info');
                        continue;
                    } else {
                        throw e; // For other errors (e.g., invalid key), fail immediately
                    }
                }
            }
            if (!generatedChunk) {
                throw lastError; // Throw the last captured error if all keys failed
            }
        } else { // Gemini
          const apiKey = selectAndRecordGeminiKey();
          if (!apiKey) {
            throw new Error('All Gemini API keys have reached their daily limit.');
          }
          if (!keyUsedToastShown) {
            addToast(`Using Gemini Key ending in ...${apiKey.slice(-4)}`, 'info');
            keyUsedToastShown = true;
          }
          const audioPart = await generateGeminiAudio(apiKey, settings.voiceId, chunk);
          audioParts.push(audioPart);
        }

        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
        }
      } catch (e: any) {
        setIsLoading(false);
        throw e; 
      }
    }
    
    if (audioParts.length > 0) {
        let finalBlob: Blob;

        if (settings.service === TtsService.ElevenLabs) {
            finalBlob = new Blob(audioParts as Blob[], { type: 'audio/mpeg' });
        } else { // Gemini
            const pcmParts = audioParts as Uint8Array[];
            const totalLength = pcmParts.reduce((acc, val) => acc + val.length, 0);
            const combinedPcm = new Uint8Array(totalLength);
            let offset = 0;
            for (const part of pcmParts) {
                combinedPcm.set(part, offset);
                offset += part.length;
            }
            const sampleRate = 24000;
            const channels = 1;
            const sampleWidth = 2; // 16-bit
            finalBlob = createWavBlob(combinedPcm, sampleRate, channels, sampleWidth);
        }

        const voiceName = voices.find(v => v.id === settings.voiceId)?.name || 'Unknown';
        const now = Date.now();
        const newAudio: GeneratedAudio = {
            id: `audio-final-${now}`,
            blob: finalBlob,
            text: text,
            url: URL.createObjectURL(finalBlob),
            voiceName: voiceName,
            createdAt: now,
            displayName: text.substring(0, 50) || 'Untitled Audio'
        };
        
        await addAudioToDB(newAudio);
        setGeneratedAudio(prevAudio => [newAudio, ...prevAudio]);
        
        if (settings.service === TtsService.ElevenLabs) {
            fetchElevenLabsUser();
        }
    }


    setIsLoading(false);
  };

  const deleteAudio = useCallback(async (id: string) => {
    const audioToDelete = generatedAudio.find(a => a.id === id);
    if (audioToDelete) {
        URL.revokeObjectURL(audioToDelete.url);
    }
    await deleteAudioFromDB(id);
    setGeneratedAudio(prev => prev.filter(a => a.id !== id));
  }, [generatedAudio]);

  const clearHistory = useCallback(async () => {
    generatedAudio.forEach(audio => URL.revokeObjectURL(audio.url));
    await clearAllAudioFromDB();
    setGeneratedAudio([]);
  }, [generatedAudio]);

  const updateAudioDisplayName = useCallback(async (id: string, newName: string) => {
      const audioToUpdate = generatedAudio.find(a => a.id === id);
      if (audioToUpdate) {
          const updatedAudio = { ...audioToUpdate, displayName: newName };
          await updateAudioInDB(updatedAudio);
          setGeneratedAudio(prev => prev.map(a => a.id === id ? updatedAudio : a));
      }
  }, [generatedAudio]);

  return { voices, fetchVoices, isFetchingVoices, generate, isLoading, generatedAudio, progress, deleteAudio, clearHistory, updateAudioDisplayName, elevenLabsUser, fetchElevenLabsUser };
};
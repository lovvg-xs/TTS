import { useState, useEffect, useCallback } from 'react';
import { ApiKeys } from '../types';

const API_KEYS_STORAGE_KEY = 'tts-api-keys';

const getInitialKeys = (): ApiKeys => {
  try {
    const item = window.localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      // Ensure gemini keys are always an array and filter out any falsy values
      const geminiKeys = (Array.isArray(parsed.gemini) ? parsed.gemini : []).filter(Boolean);
      // Handle ElevenLabs keys, supporting both new array format and old string format for backward compatibility
      const elevenLabsKeys = (Array.isArray(parsed.elevenLabs) 
        ? parsed.elevenLabs 
        : (parsed.elevenLabs ? [parsed.elevenLabs] : [])
      ).filter(Boolean);
      
      return {
        elevenLabs: elevenLabsKeys,
        gemini: geminiKeys,
      };
    }
  } catch (error) {
    console.error('Error reading API keys from localStorage', error);
  }
  return { elevenLabs: [], gemini: [] };
};

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(getInitialKeys);

  useEffect(() => {
    try {
      window.localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
    } catch (error) {
      console.error('Error saving API keys to localStorage', error);
    }
  }, [apiKeys]);

  const saveApiKeys = useCallback((newKeys: ApiKeys) => {
    const cleanedKeys: ApiKeys = {
      // Ensure we only store unique, non-empty keys for both services
      elevenLabs: [...new Set(newKeys.elevenLabs.map(k => k.trim()).filter(Boolean))],
      gemini: [...new Set(newKeys.gemini.map(k => k.trim()).filter(Boolean))],
    };
    setApiKeys(cleanedKeys);
  }, []);

  return { apiKeys, saveApiKeys };
};

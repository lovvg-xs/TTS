import { useState, useEffect, useCallback } from 'react';
import { TtsService, Settings } from '../types';
import { SETTINGS_STORAGE_KEY, ELEVENLABS_MODELS } from '../constants';

const getInitialSettings = (): Settings => {
    try {
        const item = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (item) {
            const parsed = JSON.parse(item);
            // Basic validation to prevent loading corrupted data
            if (parsed.service && parsed.elevenLabs) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('Error reading settings from localStorage', error);
    }
    // Return default settings if nothing is stored or data is invalid
    return {
        service: TtsService.ElevenLabs,
        voiceId: '',
        elevenLabs: {
            modelId: ELEVENLABS_MODELS[0].id,
            settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
        },
    };
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        try {
            window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage', error);
        }
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);
    
    const updateElevenLabsSettings = useCallback((newElevenLabsSettings: Partial<Settings['elevenLabs']>) => {
        setSettings(prev => ({ 
            ...prev, 
            elevenLabs: {
                ...prev.elevenLabs,
                ...newElevenLabsSettings,
            }
        }));
    }, []);
    
    const updateElevenLabsTuning = useCallback((newTuning: Partial<Settings['elevenLabs']['settings']>) => {
        setSettings(prev => ({
            ...prev,
            elevenLabs: {
                ...prev.elevenLabs,
                settings: {
                    ...prev.elevenLabs.settings,
                    ...newTuning,
                }
            }
        }));
    }, []);

    return { settings, updateSettings, updateElevenLabsSettings, updateElevenLabsTuning };
};

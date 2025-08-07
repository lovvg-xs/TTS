import { useEffect } from 'react';
import type { FC } from 'react';
import { TtsService, Voice, Settings, ElevenLabsUser } from '../types';
import Spinner from './Spinner';
import { ELEVENLABS_MODELS } from '../constants';
import InfoIcon from './icons/InfoIcon';

interface ControlsProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onElevenLabsSettingsChange: (newElevenLabsSettings: Partial<Settings['elevenLabs']>) => void;
  onElevenLabsTuningChange: (newTuning: Partial<Settings['elevenLabs']['settings']>) => void;
  voices: Voice[];
  onGenerate: () => void;
  isLoading: boolean;
  isFetchingVoices: boolean;
  isTextEmpty: boolean;
  fetchVoices: (service: TtsService) => void;
  apiKeySet: boolean;
  progress: { current: number; total: number };
  elevenLabsUser: ElevenLabsUser | null;
}

const Controls: FC<ControlsProps> = ({
  settings,
  onSettingsChange,
  onElevenLabsSettingsChange,
  onElevenLabsTuningChange,
  voices,
  onGenerate,
  isLoading,
  isFetchingVoices,
  isTextEmpty,
  fetchVoices,
  apiKeySet,
  progress,
  elevenLabsUser,
}) => {
  useEffect(() => {
    if (apiKeySet) {
      fetchVoices(settings.service);
    } else {
        onSettingsChange({ voiceId: '' });
    }
  }, [settings.service, apiKeySet, fetchVoices]);

  const handleServiceChange = (newService: TtsService) => {
    onSettingsChange({ service: newService, voiceId: '' }); 
  };
  
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ voiceId: e.target.value });
  }
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onElevenLabsSettingsChange({ modelId: e.target.value });
  }

  const isGenerateDisabled = isLoading || isTextEmpty || !settings.voiceId || !apiKeySet;
  
  const quota = elevenLabsUser?.subscription;
  const quotaUsed = quota ? quota.character_count : 0;
  const quotaLimit = quota ? quota.character_limit : 0;
  const quotaPercentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">TTS Service</label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
          {[TtsService.ElevenLabs, TtsService.Gemini].map(service => (
            <button
              key={service}
              onClick={() => handleServiceChange(service)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                settings.service === service
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="voice-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Voice</label>
        <div className="relative">
          <select
            id="voice-select"
            value={settings.voiceId}
            onChange={handleVoiceChange}
            disabled={isFetchingVoices || !apiKeySet || voices.length === 0}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <option value="" disabled>{isFetchingVoices ? 'Loading voices...' : (apiKeySet ? 'Select a voice' : 'API Key required')}</option>
            {voices.map((voice) => (<option key={voice.id} value={voice.id}>{voice.name}</option>))}
          </select>
          {isFetchingVoices && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner/></div>}
        </div>
      </div>
      
      {settings.service === TtsService.ElevenLabs && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
           <div>
             <label htmlFor="model-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Model</label>
             <select
                id="model-select"
                value={settings.elevenLabs.modelId}
                onChange={handleModelChange}
                disabled={!apiKeySet}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                  {ELEVENLABS_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
           </div>
           
           <div>
             <label htmlFor="stability" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Stability ({settings.elevenLabs.settings.stability})</label>
             <input type="range" id="stability" min="0" max="1" step="0.01" value={settings.elevenLabs.settings.stability} onChange={e => onElevenLabsTuningChange({ stability: +e.target.value })} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
           </div>

           <div>
             <label htmlFor="similarity" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Similarity Boost ({settings.elevenLabs.settings.similarity_boost})</label>
             <input type="range" id="similarity" min="0" max="1" step="0.01" value={settings.elevenLabs.settings.similarity_boost} onChange={e => onElevenLabsTuningChange({ similarity_boost: +e.target.value })} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"/>
           </div>

           {quota && quota.status !== 'free' && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <InfoIcon className="w-4 h-4" />
                    <span>Character Quota</span>
                  </div>
                  <span>{quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{width: `${quotaPercentage}%`}}></div>
                </div>
              </div>
            )}
        </div>
      )}

      <div>
        <button
          onClick={onGenerate}
          disabled={isGenerateDisabled}
          className="relative w-full bg-brand-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors hover:bg-brand-600 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed overflow-hidden"
        >
          {isLoading && (
            <div className="absolute top-0 left-0 h-full bg-brand-600/70" style={{ width: `${progressPercentage}%`, transition: 'width 0.2s ease-in-out' }}></div>
          )}
          <span className="relative z-10 flex items-center">
            {isLoading ? (
                <><Spinner /><span className="ml-2">Generating... ({progress.current}/{progress.total})</span></>
            ) : ('Generate Audio')}
          </span>
        </button>
        {!apiKeySet && (<p className="text-center text-xs text-yellow-500 dark:text-yellow-400 mt-2">Please set your {settings.service} API key in Settings to enable generation.</p>)}
      </div>
    </div>
  );
};

export default Controls;
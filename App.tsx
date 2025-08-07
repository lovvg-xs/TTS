

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import TextAreaInput from './components/TextAreaInput';
import Controls from './components/Controls';
import AudioPlayer from './components/AudioPlayer';
import { useApiKeys } from './hooks/useApiKeys';
import { useTts } from './hooks/useTts';
import { useSettings } from './hooks/useSettings';
import { useToast } from './hooks/useToast';
import { TtsService } from './types';

interface AppProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

function App({ isAuthenticated, onLogout }: AppProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { apiKeys, saveApiKeys } = useApiKeys();
  const { settings, updateSettings, updateElevenLabsSettings, updateElevenLabsTuning } = useSettings();
  const { addToast } = useToast();
  
  const [text, setText] = useState('');

  const {
    voices,
    fetchVoices,
    isFetchingVoices,
    generate,
    isLoading,
    generatedAudio,
    progress,
    deleteAudio,
    clearHistory,
    updateAudioDisplayName,
    elevenLabsUser,
    fetchElevenLabsUser
  } = useTts({ apiKeys, addToast });
  
  useEffect(() => {
    const hasElevenLabsKey = apiKeys.elevenLabs.length > 0;
    const hasGeminiKey = apiKeys.gemini.length > 0;

    const isCurrentServiceKeyMissing =
      (settings.service === TtsService.ElevenLabs && !hasElevenLabsKey) ||
      (settings.service === TtsService.Gemini && !hasGeminiKey);

    if (isCurrentServiceKeyMissing) {
      if (hasElevenLabsKey) {
        updateSettings({ service: TtsService.ElevenLabs, voiceId: '' });
      } else if (hasGeminiKey) {
        updateSettings({ service: TtsService.Gemini, voiceId: '' });
      }
    }
  }, [apiKeys, settings.service, updateSettings]);

  useEffect(() => {
      if (settings.service === TtsService.ElevenLabs && apiKeys.elevenLabs.length > 0) {
          fetchElevenLabsUser();
      }
  }, [settings.service, apiKeys.elevenLabs, fetchElevenLabsUser]);


  const handleGenerate = async () => {
    if (text && settings.voiceId) {
      try {
        await generate(text, settings);
        addToast('Audio generated successfully!', 'success');
      } catch (e: any) {
        addToast(e.message || 'An unknown error occurred.', 'error');
      }
    }
  };
  
  const handleFetchVoices = useCallback(async (service: TtsService) => {
    try {
        await fetchVoices(service);
    } catch(e: any) {
        addToast(e.message || `Failed to fetch voices for ${service}.`, 'error');
    }
  }, [fetchVoices, addToast]);

  const handleRename = useCallback(async (id: string, newName: string) => {
      try {
          await updateAudioDisplayName(id, newName);
          addToast('Audio renamed!', 'success');
      } catch (e: any) {
          addToast(e.message || 'Failed to rename audio.', 'error');
      }
  }, [updateAudioDisplayName, addToast]);

  const isApiKeySetForService = settings.service === TtsService.ElevenLabs
    ? apiKeys.elevenLabs.length > 0
    : apiKeys.gemini.length > 0;

  return (
    <div className={`min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900`}>
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />

      <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Controls
            settings={settings}
            onSettingsChange={updateSettings}
            onElevenLabsSettingsChange={updateElevenLabsSettings}
            onElevenLabsTuningChange={updateElevenLabsTuning}
            voices={voices}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isFetchingVoices={isFetchingVoices}
            isTextEmpty={!text.trim()}
            fetchVoices={handleFetchVoices}
            apiKeySet={isApiKeySetForService}
            progress={progress}
            elevenLabsUser={elevenLabsUser}
          />
          <div className="flex-grow min-h-[300px] lg:min-h-0">
             <TextAreaInput text={text} setText={setText} disabled={isLoading} />
          </div>
        </div>

        <div className="flex flex-col min-h-[400px] lg:min-h-0">
          <AudioPlayer 
            audioFiles={generatedAudio}
            onDelete={deleteAudio}
            onClearAll={clearHistory}
            onRename={handleRename}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        saveApiKeys={saveApiKeys}
      />
    </div>
  );
}

export default App;
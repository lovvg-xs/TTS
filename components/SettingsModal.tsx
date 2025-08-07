import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { ApiKeys } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CloseIcon from './icons/CloseIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  saveApiKeys: (keys: ApiKeys) => void;
}

const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  saveApiKeys,
}) => {
  const [localElevenLabsKeys, setLocalElevenLabsKeys] = useState<string[]>([]);
  const [newElevenLabsKey, setNewElevenLabsKey] = useState('');
  const [localGeminiKeys, setLocalGeminiKeys] = useState<string[]>([]);
  const [newGeminiKey, setNewGeminiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalElevenLabsKeys(apiKeys.elevenLabs);
      setLocalGeminiKeys(apiKeys.gemini);
      setNewElevenLabsKey('');
      setNewGeminiKey('');
    }
  }, [apiKeys, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalElevenLabsKeys = [...localElevenLabsKeys];
    if (newElevenLabsKey.trim() && !finalElevenLabsKeys.includes(newElevenLabsKey.trim())) {
      finalElevenLabsKeys.push(newElevenLabsKey.trim());
    }

    let finalGeminiKeys = [...localGeminiKeys];
    if (newGeminiKey.trim() && !finalGeminiKeys.includes(newGeminiKey.trim())) {
      finalGeminiKeys.push(newGeminiKey.trim());
    }

    saveApiKeys({
      elevenLabs: finalElevenLabsKeys,
      gemini: finalGeminiKeys,
    });
    onClose();
  };

  const handleAddLocalKey = (service: 'eleven' | 'gemini') => {
    if (service === 'eleven') {
      if (newElevenLabsKey.trim() && !localElevenLabsKeys.includes(newElevenLabsKey.trim())) {
        setLocalElevenLabsKeys(prev => [...prev, newElevenLabsKey.trim()]);
        setNewElevenLabsKey('');
      }
    } else {
      if (newGeminiKey.trim() && !localGeminiKeys.includes(newGeminiKey.trim())) {
        setLocalGeminiKeys(prev => [...prev, newGeminiKey.trim()]);
        setNewGeminiKey('');
      }
    }
  };
  
  const handleKeyChange = (service: 'eleven' | 'gemini', index: number, value: string) => {
      if (service === 'eleven') {
          const updatedKeys = [...localElevenLabsKeys];
          updatedKeys[index] = value;
          setLocalElevenLabsKeys(updatedKeys);
      } else {
          const updatedKeys = [...localGeminiKeys];
          updatedKeys[index] = value;
          setLocalGeminiKeys(updatedKeys);
      }
  };

  const handleRemoveLocalKey = (service: 'eleven' | 'gemini', index: number) => {
    if (service === 'eleven') {
      setLocalElevenLabsKeys(prev => prev.filter((_, i) => i !== index));
    } else {
      setLocalGeminiKeys(prev => prev.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Settings</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <CloseIcon className="w-7 h-7" />
          </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* ElevenLabs Keys Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">ElevenLabs API Keys</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add multiple keys. The app will automatically use the next key if one runs out of credits.</p>
            <div className="space-y-3">
              {localElevenLabsKeys.map((key, index) => (
                <div key={`eleven-${index}`} className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => handleKeyChange('eleven', index, e.target.value)}
                    placeholder={`ElevenLabs API Key ${index + 1}`}
                    className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button onClick={() => handleRemoveLocalKey('eleven', index)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
             <div className="flex items-center space-x-2 mt-4">
                <input
                    type="password"
                    value={newElevenLabsKey}
                    onChange={(e) => setNewElevenLabsKey(e.target.value)}
                    placeholder="Add a new ElevenLabs API Key"
                    className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocalKey('eleven')}
                />
                <button
                    onClick={() => handleAddLocalKey('eleven')}
                    className="p-2 text-white transition-colors rounded-md bg-brand-500 hover:bg-brand-600"
                    aria-label="Add ElevenLabs Key to list"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
          
          {/* Gemini Keys Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Gemini API Keys</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add multiple keys for automatic rotation when rate limits are met.</p>
            <div className="space-y-3">
              {localGeminiKeys.map((key, index) => (
                <div key={`gemini-${index}`} className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => handleKeyChange('gemini', index, e.target.value)}
                    placeholder={`Gemini API Key ${index + 1}`}
                    className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button onClick={() => handleRemoveLocalKey('gemini', index)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
             <div className="flex items-center space-x-2 mt-4">
                <input
                    type="password"
                    value={newGeminiKey}
                    onChange={(e) => setNewGeminiKey(e.target.value)}
                    placeholder="Add a new Gemini API Key"
                    className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocalKey('gemini')}
                />
                <button
                    onClick={() => handleAddLocalKey('gemini')}
                    className="p-2 text-white transition-colors rounded-md bg-brand-500 hover:bg-brand-600"
                    aria-label="Add Gemini Key to list"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button
            onClick={handleSave}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-brand-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
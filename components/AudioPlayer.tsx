import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { GeneratedAudio } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';
import WaveformPlayer from './WaveformPlayer';
import CloseIcon from './icons/CloseIcon';

interface AudioPlayerProps {
  audioFiles: GeneratedAudio[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRename: (id: string, newName: string) => void;
}

const AudioPlayer: FC<AudioPlayerProps> = ({ audioFiles, onDelete, onClearAll, onRename }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredAudioFiles = useMemo(() => {
    if (!searchQuery) {
      return audioFiles;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return audioFiles.filter(
      (audio) =>
        audio.displayName.toLowerCase().includes(lowercasedQuery) ||
        audio.text.toLowerCase().includes(lowercasedQuery)
    );
  }, [audioFiles, searchQuery]);

  const handleDownload = (audio: GeneratedAudio) => {
    const link = document.createElement('a');
    link.href = audio.url;
    
    let extension = 'dat';
    if (audio.blob.type === 'audio/mpeg') extension = 'mp3';
    else if (audio.blob.type === 'audio/wav') extension = 'wav';

    const safeFilename = audio.displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFilename || 'audio'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartEditing = (audio: GeneratedAudio) => {
    setEditingId(audio.id);
    setEditingName(audio.displayName);
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveName = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
    }
    handleCancelEditing();
  };
  
  if (audioFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Generated audio will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg h-full flex flex-col shadow-md">
       <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 gap-4">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Audio</h3>
         <div className="flex items-center gap-2">
            <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-40 sm:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {audioFiles.length > 0 && (
                <button
                    onClick={onClearAll}
                    className="text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-red-500/10"
                    title="Clear all"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                </button>
            )}
         </div>
       </div>
      <div className="p-4 space-y-4 overflow-y-auto">
        {filteredAudioFiles.map((audio, index) => (
          <div key={audio.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-start space-x-4">
            <span className="text-xl font-bold text-brand-500 mt-1" aria-hidden="true">#{index + 1}</span>
            <div className="flex-grow space-y-3">
                {editingId === audio.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="flex-grow bg-gray-200 dark:bg-gray-600 border border-gray-400 dark:border-gray-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button onClick={handleSaveName} className="p-1.5 text-green-500 hover:text-green-400"><CheckIcon className="w-5 h-5"/></button>
                    <button onClick={handleCancelEditing} className="p-1.5 text-red-500 hover:text-red-400"><CloseIcon className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{audio.displayName}</h4>
                      <button onClick={() => handleStartEditing(audio)} className="text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-500 transition-colors"><PencilIcon className="w-4 h-4"/></button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Voice: <span className="font-medium">{audio.voiceName}</span></p>
                  </div>
                )}
               
                <WaveformPlayer audioUrl={audio.url} />

                <div className="flex items-center justify-end space-x-2">
                 <button onClick={() => handleDownload(audio)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors" title="Download"><DownloadIcon className="w-5 h-5" /></button>
                 <button onClick={() => onDelete(audio.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                </div>
            </div>
          </div>
        ))}
        {filteredAudioFiles.length === 0 && searchQuery && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No audio found for "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
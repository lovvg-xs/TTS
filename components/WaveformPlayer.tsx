import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import WaveSurfer from 'wavesurfer.js';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import { useTheme } from '../hooks/useTheme';

interface WaveformPlayerProps {
  audioUrl: string;
}

const WaveformPlayer: FC<WaveformPlayerProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const { theme } = useTheme();

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: theme === 'dark' ? '#555' : '#ccc',
      progressColor: '#1DB954',
      url: audioUrl,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 40,
      cursorWidth: 0,
    });
    wavesurferRef.current = wavesurfer;

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));
    wavesurfer.on('ready', (d) => {
        setDuration(formatTime(d));
    });
    wavesurfer.on('timeupdate', (time) => {
        setCurrentTime(formatTime(time));
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, theme]);
  
  const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="flex items-center space-x-3 w-full">
      <button
        onClick={handlePlayPause}
        className="p-2 text-white bg-brand-500 hover:bg-brand-600 rounded-full transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
      <div ref={waveformRef} className="flex-grow h-10 cursor-pointer" />
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-20 text-center">
        {currentTime} / {duration}
      </span>
    </div>
  );
};

export default WaveformPlayer;
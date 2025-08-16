import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isLoaded: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  initializeAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [audio] = useState(() => new Audio('/audio/background-ambient.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load user preferences
    const savedPreferences = localStorage.getItem('audioPreferences');
    if (savedPreferences) {
      const { volume: savedVolume, isMuted: savedMuted } = JSON.parse(savedPreferences);
      setVolumeState(savedVolume);
      setIsMuted(savedMuted);
    }

    // Configure audio
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = volume;

    // Audio event listeners
    const handleCanPlay = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio]);

  useEffect(() => {
    audio.volume = isMuted ? 0 : volume;
  }, [audio, volume, isMuted]);

  useEffect(() => {
    // Save preferences
    localStorage.setItem('audioPreferences', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);

  const initializeAudio = async () => {
    if (isInitialized) return;
    
    try {
      // Try to play (will fail if autoplay is blocked)
      await audio.play();
      setIsInitialized(true);
    } catch (error) {
      // Autoplay was blocked, user needs to interact first
      console.log('Autoplay blocked, waiting for user interaction');
      setIsInitialized(true);
    }
  };

  const togglePlay = async () => {
    if (!isInitialized) {
      await initializeAudio();
    }

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Audio play error:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        isLoaded,
        togglePlay,
        toggleMute,
        setVolume,
        initializeAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
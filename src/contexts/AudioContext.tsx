import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  // Fetch audio settings from database
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('background_audio_url, background_audio_enabled')
          .single();

        if (error) {
          console.error('Error fetching audio settings:', error);
          return;
        }

        setAudioSettings(data);
      } catch (error) {
        console.error('Error fetching audio settings:', error);
      }
    };

    fetchAudioSettings();
  }, []);

  useEffect(() => {
    // Only proceed if we have audio settings and audio is enabled
    if (!audioSettings?.background_audio_enabled || !audioSettings?.background_audio_url) {
      setIsLoaded(false);
      return;
    }

    // Create audio element with the URL from database
    const newAudio = new Audio(audioSettings.background_audio_url);
    setAudio(newAudio);
    // Load user preferences
    const savedPreferences = localStorage.getItem('audioPreferences');
    if (savedPreferences) {
      const { volume: savedVolume, isMuted: savedMuted } = JSON.parse(savedPreferences);
      setVolumeState(savedVolume);
      setIsMuted(savedMuted);
    }

    if (!newAudio) return;

    // Configure audio
    newAudio.loop = true;
    newAudio.preload = 'auto';
    newAudio.volume = volume;

    // Audio event listeners
    const handleCanPlay = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    newAudio.addEventListener('canplaythrough', handleCanPlay);
    newAudio.addEventListener('play', handlePlay);
    newAudio.addEventListener('pause', handlePause);
    newAudio.addEventListener('ended', handleEnded);

    return () => {
      newAudio.removeEventListener('canplaythrough', handleCanPlay);
      newAudio.removeEventListener('play', handlePlay);
      newAudio.removeEventListener('pause', handlePause);
      newAudio.removeEventListener('ended', handleEnded);
      newAudio.pause();
      newAudio.src = '';
    };
  }, [audioSettings, volume]);

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
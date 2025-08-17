import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
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
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  // Fetch the enabled audio setting with a valid URL
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('background_audio_url, background_audio_enabled')
          .eq('background_audio_enabled', true)
          .not('background_audio_url', 'is', null)
          .maybeSingle();

        if (error) {
          console.error('Error fetching audio settings:', error);
          setAudioSettings({ background_audio_url: null, background_audio_enabled: false });
          return;
        }

        if (!data) {
          console.warn('No valid audio settings found, using defaults');
          setAudioSettings({ background_audio_url: null, background_audio_enabled: false });
          return;
        }

        setAudioSettings(data);
      } catch (err) {
        console.error('Error fetching audio settings:', err);
        setAudioSettings({ background_audio_url: null, background_audio_enabled: false });
      }
    };

    fetchAudioSettings();
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (isAdminPage || !audioSettings?.background_audio_enabled || !audioSettings?.background_audio_url) {
      setIsLoaded(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const newAudio = new Audio(audioSettings.background_audio_url);
    audioRef.current = newAudio;

    // Load saved preferences
    const savedPrefs = localStorage.getItem('audioPreferences');
    if (savedPrefs) {
      const { volume: savedVolume, isMuted: savedMuted } = JSON.parse(savedPrefs);
      setVolumeState(savedVolume ?? 0.4);
      setIsMuted(savedMuted ?? false);
    }

    newAudio.loop = true;
    newAudio.preload = 'auto';
    newAudio.volume = isMuted ? 0 : volume;

    const handleCanPlay = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    newAudio.addEventListener('canplaythrough', handleCanPlay);
    newAudio.addEventListener('play', handlePlay);
    newAudio.addEventListener('pause', handlePause);
    newAudio.addEventListener('ended', handleEnded);

    // Attempt autoplay (mobile-friendly)
    const tryAutoPlay = async () => {
      try {
        if (!isInitialized && document.visibilityState === 'visible') {
          await newAudio.play();
          setIsInitialized(true);
        }
      } catch {
        setIsInitialized(true);
      }
    };

    document.addEventListener('touchstart', tryAutoPlay, { once: true });
    document.addEventListener('click', tryAutoPlay, { once: true });
    newAudio.addEventListener('canplaythrough', tryAutoPlay, { once: true });

    return () => {
      newAudio.removeEventListener('canplaythrough', handleCanPlay);
      newAudio.removeEventListener('play', handlePlay);
      newAudio.removeEventListener('pause', handlePause);
      newAudio.removeEventListener('ended', handleEnded);
      document.removeEventListener('touchstart', tryAutoPlay);
      document.removeEventListener('click', tryAutoPlay);
      newAudio.pause();
      newAudio.src = '';
      audioRef.current = null;
    };
  }, [audioSettings, isAdminPage]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem('audioPreferences', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);

  const initializeAudio = async () => {
    if (isInitialized || !audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsInitialized(true);
    } catch {
      setIsInitialized(true);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!isInitialized) {
      await initializeAudio();
      return;
    }
    try {
      if (isPlaying) audioRef.current.pause();
      else await audioRef.current.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => setIsMuted((prev) => !prev);
  const setVolume = (v: number) => setVolumeState(Math.max(0, Math.min(1, v)));

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

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
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  // Fetch audio settings from Supabase
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('background_audio_url, background_audio_enabled')
          .single();

        if (error) throw error;

        setAudioSettings(data);
      } catch (error) {
        console.error('Error fetching audio settings:', error);
        setAudioSettings(null);
      }
    };
    fetchAudioSettings();
  }, []);

  // Initialize or update audio element
  useEffect(() => {
    if (!audioSettings?.background_audio_enabled || !audioSettings?.background_audio_url || isAdminPage) {
      setIsLoaded(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const audio = new Audio(audioSettings.background_audio_url);
    audioRef.current = audio;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : volume;

    const handleCanPlay = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Try autoplay on user interaction for mobile
    const tryPlay = () => {
      audio.play().catch(() => {
        console.log('Autoplay blocked, user interaction required');
      });
    };
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };
  }, [audioSettings, isMuted, volume, isAdminPage]);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const initializeAudio = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch {
      console.log('Audio ready but user interaction required');
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch {
        console.log('Play failed, user interaction required');
      }
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const setVolume = (v: number) => setVolumeState(Math.max(0, Math.min(1, v)));

  return (
    <AudioContext.Provider
      value={{ isPlaying, isMuted, volume, isLoaded, togglePlay, toggleMute, setVolume, initializeAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
};

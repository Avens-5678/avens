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

  // Fetch audio settings
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('background_audio_url, background_audio_enabled')
          .eq('background_audio_enabled', true)
          .not('background_audio_url', 'is', null)
          .limit(1);

        if (error) {
          console.error('Error fetching audio settings:', error);
          return;
        }

        if (data && data.length > 0) {
          setAudioSettings(data[0]);
        } else {
          console.warn('No audio settings available');
          setAudioSettings(null);
        }
      } catch (err) {
        console.error('Error fetching audio settings:', err);
      }
    };

    fetchAudioSettings();
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioSettings?.background_audio_url || isAdminPage) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      setIsLoaded(false);
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

    // Mobile autoplay on first user interaction
    const tryAutoPlay = async () => {
      if (!isInitialized) {
        try {
          await newAudio.play();
        } catch (e) {
          console.log('Autoplay blocked, user interaction needed');
        } finally {
          setIsInitialized(true);
        }
      }
    };

    document.addEventListener('click', tryAutoPlay, { once: true });
    document.addEventListener('touchstart', tryAutoPlay, { once: true });

    return () => {
      newAudio.removeEventListener('canplaythrough', handleCanPlay);
      newAudio.removeEventListener('play', handlePlay);
      newAudio.removeEventListener('pause', handlePause);
      newAudio.removeEventListener('ended', handleEnded);
      document.removeEventListener('click', tryAutoPlay);
      document.removeEventListener('touchstart', tryAutoPlay);
      newAudio.pause();
      newAudio.src = '';
      audioRef.current = null;
    };
  }, [audioSettings, isAdminPage, volume, isMuted, isInitialized]);

  // Update volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Save preferences
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

  const toggleMute = () => setIsMuted(prev => !prev);
  const setVolume = (newVolume: number) => setVolumeState(Math.max(0, Math.min(1, newVolume)));

  return (
    <AudioContext.Provider
      value={{ isPlaying, isMuted, volume, isLoaded, togglePlay, toggleMute, setVolume, initializeAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
};

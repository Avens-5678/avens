import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  // Fetch audio settings only if user is logged in
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        if (!supabase.auth.getUser) return;

        const { data, error } = await supabase
          .from('site_settings')
          .select('background_audio_url, background_audio_enabled')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.warn('No site_settings row for this user or not admin.');
          } else {
            console.error('Error fetching audio settings:', error);
            toast({
              title: 'Error',
              description: 'Failed to load audio settings. Are you an admin?',
              variant: 'destructive',
            });
          }
          return;
        }

        setAudioSettings(data);
      } catch (err) {
        console.error('Unexpected error fetching audio settings:', err);
      }
    };

    fetchAudioSettings();
  }, [toast]);

  // Initialize and play audio
  useEffect(() => {
    if (!audioSettings?.background_audio_enabled || !audioSettings?.background_audio_url || isAdminPage) {
      setIsLoaded(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const newAudio = new Audio(audioSettings.background_audio_url);
    audioRef.current = newAudio;

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

    // Mobile autoplay after user interaction
    const tryAutoPlay = async () => {
      if (!isInitialized) {
        try {
          await newAudio.play();
          setIsInitialized(true);
        } catch {
          console.log('Autoplay blocked, user interaction required.');
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
  }, [audioSettings, isAdminPage, isMuted, volume, isInitialized]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    localStorage.setItem('audioPreferences', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);

  const initializeAudio = async () => {
    if (!audioRef.current || isInitialized) return;
    try {
      await audioRef.current.play();
      setIsInitialized(true);
    } catch {
      console.log('Autoplay blocked, ready for user interaction.');
      setIsInitialized(true);
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
  const setVolume = (newVolume: number) => setVolumeState(Math.max(0, Math.min(1, newVolume)));

  return (
    <AudioContext.Provider
      value={{ isPlaying, isMuted, volume, isLoaded, togglePlay, toggleMute, setVolume, initializeAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
};

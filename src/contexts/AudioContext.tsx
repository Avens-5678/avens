import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  id: string;
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  // ✅ Fetch audio settings only if user is logged in as super_admin
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        // Get current logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('User not logged in');

        // Check super_admin in admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id,email,role,is_active')
          .eq('email', user.email)
          .eq('role', 'super_admin')
          .eq('is_active', true)
          .maybeSingle();

        if (adminError) throw new Error('Failed to verify admin privileges');
        if (!adminData) throw new Error('Super admin privileges required');

        // Fetch audio settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .maybeSingle();

        if (settingsError) throw new Error('Failed to load audio settings');

        setAudioSettings(settingsData || null);
      } catch (error: any) {
        console.error(error);
        setAudioSettings(null);
        setIsLoaded(false);
      }
    };

    fetchAudioSettings();
  }, []);

  useEffect(() => {
    if (!audioSettings?.background_audio_enabled || !audioSettings.background_audio_url) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setIsLoaded(false);
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

    const tryAutoPlay = async () => {
      try {
        await newAudio.play();
        setIsInitialized(true);
      } catch {
        setIsInitialized(false);
      }
    };

    document.addEventListener('click', tryAutoPlay, { once: true });
    document.addEventListener('touchstart', tryAutoPlay, { once: true });

    return () => {
      newAudio.pause();
      newAudio.src = '';
      audioRef.current = null;
      document.removeEventListener('click', tryAutoPlay);
      document.removeEventListener('touchstart', tryAutoPlay);
    };
  }, [audioSettings]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
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
    if (!isInitialized) return initializeAudio();
    if (isPlaying) audioRef.current.pause();
    else await audioRef.current.play();
  };

  const toggleMute = () => setIsMuted(prev => !prev);
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

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  const isAdminPage = location.pathname.startsWith('/admin');

  // Fetch initial settings on load
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .maybeSingle();
        if (error) throw error;
        setAudioSettings(data as SiteSettings | null);
      } catch (error) {
        console.error('Error fetching initial audio settings:', error);
      }
    };
    fetchAudioSettings();
  }, []);

  // REALTIME SUBSCRIPTION: Listen for database changes
  useEffect(() => {
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          console.log('Realtime update received!', payload);
          setAudioSettings(payload.new as SiteSettings);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Effect to manage the audio element based on settings
  useEffect(() => {
    // Stop and unload audio if disabled, on admin page, or no URL
    if (isAdminPage || !audioSettings?.background_audio_enabled || !audioSettings?.background_audio_url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
        setIsPlaying(false);
        setIsLoaded(false);
      }
      return;
    }

    // If audio should play but isn't loaded yet, create it
    if (!audioRef.current) {
      const newAudio = new Audio(audioSettings.background_audio_url);
      newAudio.loop = true;
      audioRef.current = newAudio;

      const savedPrefs = localStorage.getItem('audioPreferences');
      if (savedPrefs) {
        const { volume, isMuted } = JSON.parse(savedPrefs);
        setVolumeState(volume ?? 0.4);
        setIsMuted(isMuted ?? false);
        newAudio.volume = isMuted ? 0 : volume;
      }
      
      const playPromise = newAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }

      newAudio.oncanplaythrough = () => setIsLoaded(true);
      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onpause = () => setIsPlaying(false);
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSettings, isAdminPage]);

  // Effect to sync volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('audioPreferences', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const setVolume = (newVolume: number) => setVolumeState(Math.max(0, Math.min(1, newVolume)));

  return (
    <AudioContext.Provider value={{ isPlaying, isMuted, volume, isLoaded, togglePlay, toggleMute, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

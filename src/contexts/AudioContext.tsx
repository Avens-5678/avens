import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.4);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  // Fetch audio settings from Supabase
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
    audioRef.current = newAudio;

    // Load saved preferences
    const savedPreferences = localStorage.getItem('audioPreferences');
    if (savedPreferences) {
      const { volume: savedVolume, isMuted: savedMuted } = JSON.parse(savedPreferences);
      setVolumeState(savedVolume ?? 0.4);
      setIsMuted(savedMuted ?? false);
    }

    // Configure audio
    newAudio.loop = true;
    newAudio.preload = 'auto';
    newAudio.volume = isMuted ? 0 : volume;

    // Audio event listeners
    const handleCanPlay = () => setIsLoaded(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    newAudio.addEventListener('canplaythrough', handleCanPlay);
    newAudio.addEventListener('play', handlePlay);
    newAudio.addEventListener('pause', handlePause);
    newAudio.addEventListener('ended', handleEnded);

    // Auto-play when audio is ready
    const handleAutoPlay = async () => {
      try {
        await newAudio.play();
        setIsInitialized(true);
      } catch (error) {
        console.log('Autoplay blocked by browser, user interaction required');
        setIsInitialized(false);
      }
    };

    newAudio.addEventListener('canplaythrough', handleAutoPlay, { once: true });

    return () => {
      newAudio.removeEventListener('canplaythrough', handleCanPlay);
      newAudio.removeEventListener('play', handlePlay);
      newAudio.removeEventListener('pause', handlePause);
      newAudio.removeEventListener('ended', handleEnded);
      newAudio.pause();
      newAudio.src = '';
      audioRef.current = null;
    };
  }, [audioSettings]);

  // Update volume & mute state safely
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
      // For mobile: attempt to play after user interaction
      const playPromise = audioRef.current.play();
      await playPromise;
      setIsInitialized(true);
    } catch (error) {
      // If autoplay fails, mark as initialized but not playing
      console.log('Autoplay blocked, audio ready for user interaction');
      setIsInitialized(true);
      // Don't set isPlaying to true if play failed
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    // Initialize audio if not done yet (mobile needs user interaction)
    if (!isInitialized) {
      await initializeAudio();
      return; // initializeAudio handles the play attempt
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        await playPromise;
      }
    } catch (error) {
      console.error('Audio play error:', error);
      // Reset playing state if play fails
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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

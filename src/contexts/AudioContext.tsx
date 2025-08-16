// src/contexts/AudioContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Use the same client for consistency

interface SiteSettings {
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isLoaded: boolean;
  isAudioEnabled: boolean; // FIX: Expose enabled status
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
  const supabase = createClientComponentClient();
  const audioRef = useRef<HTMLAudioElement | null>(null); // Use a ref for the audio element
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // To handle initial user interaction
  const [audioSettings, setAudioSettings] = useState<SiteSettings | null>(null);

  // 1. Fetch audio settings once
  useEffect(() => {
    const fetchAudioSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('background_audio_url, background_audio_enabled')
        .single();

      if (error) {
        console.error('Error fetching audio settings:', error.message);
        return;
      }
      setAudioSettings(data);
    };

    fetchAudioSettings();
  }, [supabase]);
  
  // 2. Create or destroy the audio element when settings change
  useEffect(() => {
    // If audio is disabled or has no URL, tear down the existing audio element
    if (!audioSettings?.background_audio_enabled || !audioSettings.background_audio_url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsLoaded(false);
      setIsPlaying(false);
      return;
    }
    
    // If an audio element already exists for the current URL, do nothing
    if (audioRef.current && audioRef.current.src === audioSettings.background_audio_url) {
        return;
    }

    // Create a new audio element
    const audio = new Audio(audioSettings.background_audio_url);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleCanPlay = () => setIsLoaded(true);
    audio.addEventListener('canplaythrough', handleCanPlay);
    
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('audioPreferences');
    if (savedPreferences) {
      const { volume: savedVolume, isMuted: savedMuted } = JSON.parse(savedPreferences);
      setVolumeState(savedVolume);
      setIsMuted(savedMuted);
    }
    
    // Cleanup function
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.pause();
      audioRef.current = null;
    };
  // FIX: This effect should ONLY run when settings change, not when volume changes.
  }, [audioSettings]);

  // 3. Update volume and mute status when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    // Save preferences whenever volume or mute status changes
    localStorage.setItem('audioPreferences', JSON.stringify({ volume, isMuted }));
  }, [volume, isMuted]);
  
  // 4. Player controls
  const togglePlay = async () => {
    if (!audioRef.current || !isLoaded) return;
    
    // First interaction handler
    if (!isInitialized) {
        try {
            await audioRef.current.play();
            setIsPlaying(true);
            setIsInitialized(true);
        } catch (error) {
            console.log('Autoplay was blocked. Waiting for another user interaction.');
        }
        return; // Exit after first attempt
    }

    // Subsequent play/pause toggles
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error trying to play audio:', error);
      }
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const setVolume = (newVolume: number) => setVolumeState(Math.max(0, Math.min(1, newVolume)));
  
  // FIX: Create a boolean to easily check if audio is active
  const isAudioEnabled = !!audioSettings?.background_audio_enabled && !!audioSettings?.background_audio_url;

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        isLoaded,
        isAudioEnabled, // FIX: Pass this down to the context
        togglePlay,
        toggleMute,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
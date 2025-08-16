"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
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

  // Fetch audio settings from Supabase
  useEffect(() => {
    const fetchAudioSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("background_audio_url, background_audio_enabled")
        .single();

      if (error) {
        console.error("Error fetching audio settings:", error);
        return;
      }

      if (data?.background_audio_enabled && data?.background_audio_url) {
        const newAudio = new Audio(data.background_audio_url);
        newAudio.loop = true;
        newAudio.preload = "auto";
        newAudio.volume = volume;

        newAudio.addEventListener("canplaythrough", () => setIsLoaded(true));
        newAudio.addEventListener("play", () => setIsPlaying(true));
        newAudio.addEventListener("pause", () => setIsPlaying(false));

        setAudio(newAudio);
      }
    };

    fetchAudioSettings();
  }, []);

  // Keep volume/mute in sync
  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [audio, volume, isMuted]);

  const togglePlay = async () => {
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
      console.warn("Play attempt failed:", err);
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  audioUrl: string | null;
  isPlaying: boolean;
  playAudio: (url: string) => void;
  pauseAudio: () => void;
  togglePlay: () => void;
  settings: SiteSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Fetch settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .single();
        if (error) throw error;
        setSettings(data);
        if (data?.background_audio_enabled && data.background_audio_url) {
          setAudioUrl(data.background_audio_url);
        }
      } catch (err) {
        console.error("Failed to fetch audio settings:", err);
      }
    };

    fetchSettings();
  }, []);

  // Handle audio element
  useEffect(() => {
    if (!audioUrl) return;

    const newAudio = new Audio(audioUrl);
    newAudio.loop = true;
    setAudio(newAudio);

    return () => {
      newAudio.pause();
      newAudio.src = "";
    };
  }, [audioUrl]);

  const playAudio = (url: string) => {
    if (!audio) return;
    audio.src = url;
    audio.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audio) return;
    if (isPlaying) pauseAudio();
    else playAudio(audioUrl!);
  };

  return (
    <AudioContext.Provider
      value={{
        audioUrl,
        isPlaying,
        playAudio,
        pauseAudio,
        togglePlay,
        settings,
        setSettings,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Hook to use in components
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

// src/contexts/AudioContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  settings: SiteSettings | null;
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  togglePlay: () => void;
  refreshSettings: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch the latest settings from Supabase
  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch audio settings:", error);
      return;
    }

    setSettings(data);

    // If audio is already playing, update its source
    if (data?.background_audio_url && audio) {
      audio.src = data.background_audio_url;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const togglePlay = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.loop = true;
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{ settings, audio, isPlaying, togglePlay, refreshSettings: fetchSettings }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// ✅ Hook to use AudioContext
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};

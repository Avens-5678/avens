import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AudioSettings {
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

export interface AudioContextType {
  isPlaying: boolean;
  settings: AudioSettings | null;
  togglePlay: () => void;
  setSettings: (settings: AudioSettings) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .single();
        if (error) throw error;
        setSettings({
          background_audio_url: data.background_audio_url,
          background_audio_enabled: data.background_audio_enabled,
        });
      } catch (err) {
        console.error("Failed to fetch audio settings", err);
      }
    };
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
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      newAudio.addEventListener("error", () => setIsPlaying(false));
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
    <AudioContext.Provider value={{ isPlaying, settings, togglePlay, setSettings }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};

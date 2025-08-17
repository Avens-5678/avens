// src/contexts/AudioContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
  refreshSettings: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No audio settings found");

      setSettings(data[0]);
    } catch (error: any) {
      console.error("Error fetching audio settings:", error);
      toast({
        title: "Error",
        description:
          "Failed to load audio settings. Please ensure you're logged in as an admin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const togglePlay = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      newAudio.addEventListener("error", () => {
        toast({
          title: "Error",
          description: "Failed to play audio file.",
          variant: "destructive",
        });
        setIsPlaying(false);
      });
      setAudio(newAudio);
      newAudio.play();
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
      value={{ settings, isLoading, isPlaying, togglePlay, refreshSettings }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Hook to use AudioContext
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

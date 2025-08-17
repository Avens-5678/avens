import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AudioSettings {
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  settings: AudioSettings | null;
  isPlaying: boolean;
  togglePlay: () => void;
  reloadSettings: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Fetch site_settings from Supabase
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      console.error("Error fetching audio settings:", err);
      toast({
        title: "Error",
        description: "Failed to load audio settings.",
        variant: "destructive",
      });
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
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      newAudio.addEventListener("error", () => {
        toast({
          title: "Audio Error",
          description: "Failed to play audio.",
          variant: "destructive",
        });
        setIsPlaying(false);
      });
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
    <AudioContext.Provider value={{ settings, isPlaying, togglePlay, reloadSettings: fetchSettings }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};

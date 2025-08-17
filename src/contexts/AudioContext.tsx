import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AudioContextType {
  audioUrl: string | null;
  isPlaying: boolean;
  playAudio: (url: string) => void;
  pauseAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (url: string) => {
    if (!audio || audioUrl !== url) {
      const newAudio = new Audio(url);
      newAudio.play();
      setAudio(newAudio);
      setAudioUrl(url);
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  return (
    <AudioContext.Provider value={{ audioUrl, isPlaying, playAudio, pauseAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

// THIS is the missing export
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
};

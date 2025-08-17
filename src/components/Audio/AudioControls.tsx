// src/components/Audio/AudioControls.tsx
import { useAudio } from "@/contexts/AudioContext";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const AudioControls = () => {
  const { togglePlay, isPlaying, settings } = useAudio();

  if (!settings?.background_audio_enabled) return null;

  return (
    <Button onClick={togglePlay}>
      {isPlaying ? <Pause /> : <Play />}
    </Button>
  );
};

export default AudioControls;

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const AudioControls = () => {
  const { isPlaying, togglePlay, settings } = useAudio();

  if (!settings?.background_audio_enabled || !settings.background_audio_url) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow flex items-center gap-2 z-50">
      <Button size="sm" onClick={togglePlay}>
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Volume2 />
    </div>
  );
};

export default AudioControls;

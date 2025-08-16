"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

export default function AudioControls() {
  const { isPlaying, togglePlay, mute, setMute } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-md p-3 rounded-full flex items-center space-x-2">
      <Button size="icon" variant="ghost" onClick={togglePlay}>
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button size="icon" variant="ghost" onClick={() => setMute(!mute)}>
        {mute ? <VolumeX /> : <Volume2 />}
      </Button>
    </div>
  );
}

"use client";

import { useAudio } from "@/context/AudioProvider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

export default function AudioControls() {
  const { isPlaying, togglePlay, mute, toggleMute, volume, setVolume } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white shadow-lg rounded-2xl flex items-center gap-3 z-50">
      <Button size="icon" onClick={togglePlay}>
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <Button size="icon" onClick={toggleMute}>
        {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}

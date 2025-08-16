// src/components/Audio/AudioControls.tsx

"use client";

import { useAudio } from "@/context/AudioProvider";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

export default function AudioControls() {
  const { 
    isPlaying, 
    togglePlay, 
    isMuted, // FIX: The context provides 'isMuted', not 'mute'
    toggleMute, 
    volume, 
    setVolume,
    isLoaded,
    isAudioEnabled // FIX: Get the enabled status from the context
  } = useAudio();

  // FIX: Do not render the component at all if audio is disabled in settings or not yet loaded.
  // This solves the problem of it showing up even when toggled off.
  if (!isAudioEnabled || !isLoaded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-background/80 backdrop-blur-sm border shadow-lg rounded-full flex items-center gap-2 z-50">
      <Button size="icon" variant="ghost" className="rounded-full" onClick={togglePlay}>
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <div className="flex items-center gap-2 group">
        <Button size="icon" variant="ghost" className="rounded-full" onClick={toggleMute}>
          {/* FIX: Use isMuted to determine which icon to show */}
          {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          // Simple styling to hide the slider until hovered
          className="w-0 group-hover:w-24 transition-all duration-300 ease-in-out"
        />
      </div>
    </div>
  );
}
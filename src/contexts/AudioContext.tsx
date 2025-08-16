// src/components/Audio/AudioControls.tsx
"use client";

import React from "react";
import { useAudio } from "@/contexts/AudioContext";

const AudioControls: React.FC = () => {
  const { isPlaying, mute, togglePlay, setMute } = useAudio();

  return (
    <div className="flex gap-2">
      <button
        onClick={togglePlay}
        className="px-3 py-1 rounded bg-blue-500 text-white"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        onClick={() => setMute(!mute)}
        className="px-3 py-1 rounded bg-gray-500 text-white"
      >
        {mute ? "Unmute" : "Mute"}
      </button>
    </div>
  );
};

export default AudioControls;

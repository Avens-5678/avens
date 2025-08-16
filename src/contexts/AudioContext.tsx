"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type AudioContextType = {
  isPlaying: boolean;
  togglePlay: () => void;
  mute: boolean;
  setMute: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClientComponentClient();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mute, setMute] = useState(false);
  const [volume, setVolume] = useState(1);

  // Load settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("background_audio_url, background_audio_enabled")
        .eq("id", 1)
        .single();

      if (!error && data?.background_audio_enabled && data.background_audio_url) {
        const newAudio = new Audio(data.background_audio_url);
        newAudio.loop = true; // 🔁 LOOP ENABLED
        newAudio.volume = volume;
        newAudio.muted = mute;
        setAudio(newAudio);
      }
    };

    fetchSettings();

    // Live updates (so toggle works without refresh)
    const channel = supabase
      .channel("site_settings-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => {
          const newSettings = payload.new as any;
          if (newSettings.background_audio_enabled && newSettings.background_audio_url) {
            const newAudio = new Audio(newSettings.background_audio_url);
            newAudio.loop = true;
            newAudio.volume = volume;
            newAudio.muted = mute;
            setAudio(newAudio);
          } else {
            audio?.pause();
            setAudio(null);
            setIsPlaying(false);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      audio?.pause();
    };
  }, [supabase, mute, volume]);

  const togglePlay = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        togglePlay,
        mute,
        setMute,
        volume,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

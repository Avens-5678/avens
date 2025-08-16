"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function AudioManager() {
  const supabase = createClientComponentClient();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) console.error(error);
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  // Enable toggle
  const handleEnableToggle = async (checked: boolean) => {
    if (!settings) return;
    const { error } = await supabase
      .from("site_settings")
      .update({ background_audio_enabled: checked })
      .eq("id", settings.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Background audio ${checked ? "enabled" : "disabled"}` });
      setSettings({ ...settings, background_audio_enabled: checked });
    }
  };

  // File upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `background-audio.${fileExt}`;
    const filePath = `audio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("site-assets").getPublicUrl(filePath);
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ background_audio_url: publicUrlData.publicUrl })
      .eq("id", settings.id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update audio URL", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Audio file uploaded successfully" });
      setSettings({ ...settings, background_audio_url: publicUrlData.publicUrl });
    }
  };

  // Delete audio
  const handleDeleteAudio = async () => {
    if (!settings?.background_audio_url) return;

    const filePath = settings.background_audio_url.split("/").pop();
    if (!filePath) return;

    await supabase.storage.from("site-assets").remove([`audio/${filePath}`]);
    await supabase.from("site_settings").update({ background_audio_url: null }).eq("id", settings.id);

    toast({ title: "Deleted", description: "Audio removed successfully" });
    setSettings({ ...settings, background_audio_url: null });
  };

  // Preview play/pause with loop
  const handlePlayPause = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.loop = true; // 🔁 Always loop
      newAudio.addEventListener("error", () => {
        toast({ title: "Error", description: "Failed to play audio file.", variant: "destructive" });
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="enable-audio"
          checked={settings?.background_audio_enabled}
          onCheckedChange={handleEnableToggle}
        />
        <Label htmlFor="enable-audio">Enable Background Audio</Label>
      </div>

      <input type="file" accept="audio/*" onChange={handleFileUpload} />

      {settings?.background_audio_url && (
        <div className="flex items-center space-x-2">
          <Button onClick={handlePlayPause}>{isPlaying ? "Pause Preview" : "Play Preview"}</Button>
          <Button variant="destructive" onClick={handleDeleteAudio}>Delete</Button>
        </div>
      )}
    </div>
  );
}

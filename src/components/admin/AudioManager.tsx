// src/components/admin/AudioManager.tsx

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

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) {
        console.error("Failed to fetch settings:", error);
        toast({ title: "Error", description: "Could not load site settings.", variant: "destructive" });
      }
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  const handleEnableToggle = async (checked: boolean) => {
    if (!settings) return;
    const { error } = await supabase
      .from("site_settings")
      .update({ background_audio_enabled: checked })
      .eq("id", settings.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    } else {
      // FIX: Used backticks (`) for the template literal string.
      toast({ title: "Success", description: `Background audio ${checked ? "enabled" : "disabled"}` });
      setSettings({ ...settings, background_audio_enabled: checked });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    const fileExt = file.name.split(".").pop();
    // FIX: Used backticks (`) to correctly create the file name string.
    const fileName = `background-audio.${fileExt}`;
    // FIX: Used backticks (`) to correctly create the file path string.
    const filePath = `audio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("site-assets").getPublicUrl(filePath);
    if (!publicUrlData) {
        toast({ title: "Error", description: "Could not get public URL for the file.", variant: "destructive" });
        return;
    }

    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ background_audio_url: publicUrlData.publicUrl })
      .eq("id", settings.id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update audio URL in settings", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Audio file uploaded successfully" });
      setSettings({ ...settings, background_audio_url: publicUrlData.publicUrl });
    }
  };

  const handleDeleteAudio = async () => {
    if (!settings?.background_audio_url) return;

    // A more robust way to get the file path from the URL
    const url = new URL(settings.background_audio_url);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf('audio')).join('/');

    if (!filePath) {
        toast({ title: "Error", description: "Could not determine file path from URL.", variant: "destructive" });
        return;
    }

    const { error: removeError } = await supabase.storage.from("site-assets").remove([filePath]);
    if (removeError) {
      toast({ title: "Storage Error", description: removeError.message, variant: "destructive" });
      // Don't stop here, still try to clear the DB entry
    }
    
    const { error: updateError } = await supabase.from("site_settings").update({ background_audio_url: null }).eq("id", settings.id);
    if (updateError) {
      toast({ title: "Database Error", description: "Failed to remove audio URL.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Audio removed successfully" });
      setSettings({ ...settings, background_audio_url: null });
      if (audio) {
        audio.pause();
        setAudio(null);
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.loop = true;
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
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Clean up audio element on component unmount
  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);


  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-lg font-medium">Background Audio Manager</h3>
      <div className="flex items-center space-x-2">
        <Switch
          id="enable-audio"
          checked={settings?.background_audio_enabled ?? false}
          onCheckedChange={handleEnableToggle}
        />
        <Label htmlFor="enable-audio">Enable Background Audio on Site</Label>
      </div>
      
      <div className="flex flex-col space-y-2">
        <Label htmlFor="audio-upload">Upload New Audio</Label>
        <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileUpload} />
        <p className="text-sm text-muted-foreground">Uploading a new file will replace the current one.</p>
      </div>


      {settings?.background_audio_url && (
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Button onClick={handlePlayPause}>{isPlaying ? "Pause Preview" : "Play Preview"}</Button>
          <Button variant="destructive" onClick={handleDeleteAudio}>Delete Audio</Button>
        </div>
      )}
    </div>
  );
}
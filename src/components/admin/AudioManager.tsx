import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Upload, Play, Pause, Trash2, Volume2 } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

const AudioManager = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { setSettings: updateContextSettings } = useAudio();

  useEffect(() => {
    fetchSettings();
    return () => {
      if (audio) audio.pause();
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error) throw error;
      setSettings(data);
      updateContextSettings({
        background_audio_url: data.background_audio_url,
        background_audio_enabled: data.background_audio_enabled,
      });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load audio settings.", variant: "destructive" });
    }
  };

  const togglePlay = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.loop = true;
      newAudio.play();
      setAudio(newAudio);
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

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;
    try {
      const { data, error } = await supabase.from("site_settings")
        .upsert({ id: settings.id, background_audio_enabled: enabled, background_audio_url: settings.background_audio_url }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      setSettings(data);
      updateContextSettings({ background_audio_url: data.background_audio_url, background_audio_enabled: data.background_audio_enabled });
      toast({ title: "Updated", description: `Background audio ${enabled ? "enabled" : "disabled"}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 /> Background Audio Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span>Enable Background Audio</span>
          <Switch checked={settings?.background_audio_enabled || false} onCheckedChange={handleToggleEnabled} />
        </div>
        {settings?.background_audio_url && (
          <div className="flex gap-2 mb-4">
            <Button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</Button>
            <Button onClick={() => window.open(settings.background_audio_url!, "_blank")}>Download</Button>
          </div>
        )}
        <Input type="file" accept="audio/*" disabled={uploading} />
      </CardContent>
    </Card>
  );
};

export default AudioManager;

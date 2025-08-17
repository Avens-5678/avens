import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Play, Pause, Trash2, Volume2 } from "lucide-react";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

const AudioManager = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchSettings();
    return () => { if (audio) audio.pause(); };
  }, []);

  const handleToggle = async (enabled: boolean) => {
    if (!settings) return;
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ id: settings.id, background_audio_enabled: enabled, background_audio_url: settings.background_audio_url }, { onConflict: "id" })
      .select()
      .single();
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setSettings(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `background-audio-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(fileName);

      const { data: updatedData, error: updateError } = await supabase
        .from("site_settings")
        .upsert({ id: settings?.id, background_audio_url: publicUrl, background_audio_enabled: true }, { onConflict: "id" })
        .select()
        .single();

      if (updateError) throw updateError;
      setSettings(updatedData);
      toast({ title: "Success", description: "Audio uploaded!" });

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePlayPause = () => {
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

  const handleDelete = async () => {
    if (!settings?.background_audio_url) return;
    const fileName = settings.background_audio_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("audio").remove([fileName]);
    }

    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ id: settings.id, background_audio_url: null, background_audio_enabled: false }, { onConflict: "id" })
      .select()
      .single();

    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setSettings(data);
    setAudio(null);
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5"/> Background Audio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Enable Background Audio</span>
          <Switch checked={settings?.background_audio_enabled || false} onCheckedChange={handleToggle} />
        </div>
        {settings?.background_audio_url && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePlayPause}>{isPlaying ? <Pause /> : <Play />}</Button>
            <span>{settings.background_audio_url.split("/").pop()}</span>
            <Button size="sm" variant="destructive" onClick={handleDelete}><Trash2 /></Button>
          </div>
        )}
        <Input type="file" accept="audio/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <Progress value={uploadProgress} />}
      </CardContent>
    </Card>
  );
};

export default AudioManager;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Play, Pause, Trash2, Volume2, Download } from "lucide-react";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

const AudioManager = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Insert a default row if table is empty
        const { data: inserted, error: insertError } = await supabase
          .from("site_settings")
          .insert({
            background_audio_url: null,
            background_audio_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setSettings(inserted);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load audio settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid File",
        description: "Please select an audio file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Audio file must be smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Delete existing audio
      if (settings?.background_audio_url) {
        const existingPath = settings.background_audio_url.split("/").pop();
        if (existingPath) {
          const { error: deleteError } = await supabase.storage
            .from("audio")
            .remove([existingPath]);
          if (deleteError && deleteError.message !== "The resource was not found") {
            console.warn("Error deleting existing file:", deleteError);
          }
        }
      }

      // Upload new file
      const fileExt = file.name.split(".").pop();
      const fileName = `background-audio-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("audio")
        .getPublicUrl(fileName);

      // Update settings
      const { data: updatedData, error: updateError } = await supabase
        .from("site_settings")
        .update({
          background_audio_url: publicUrl,
          background_audio_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings!.id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;

      setSettings(updatedData);
      toast({
        title: "Success",
        description: "Background audio uploaded successfully!",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload audio file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;

    try {
      const { data: updatedData, error } = await supabase
        .from("site_settings")
        .update({
          background_audio_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      setSettings(updatedData);
      toast({
        title: "Updated",
        description: `Background audio ${enabled ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      newAudio.addEventListener("error", () => {
        toast({
          title: "Error",
          description: "Failed to play audio file.",
          variant: "destructive",
        });
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

  const handleDelete = async () => {
    if (!settings?.background_audio_url) return;

    try {
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }

      const fileName = settings.background_audio_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("audio").remove([fileName]);
      }

      const { data: updatedData } = await supabase
        .from("site_settings")
        .update({
          background_audio_url: null,
          background_audio_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .select()
        .maybeSingle();

      setSettings(updatedData);
      setAudio(null);

      toast({
        title: "Deleted",
        description: "Background audio removed successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting audio:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete audio file.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Background Audio Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Background Audio Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="audio-enabled">Enable Background Audio</Label>
            <p className="text-sm text-muted-foreground">
              Toggle background audio for the website
            </p>
          </div>
          <Switch
            id="audio-enabled"
            checked={settings?.background_audio_enabled || false}
            onCheckedChange={handleToggleEnabled}
          />
        </div>

        {settings?.background_audio_url && (
          <div className="space-y-4">
            <Label>Current Audio File</Label>
            <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">
                {settings.background_audio_url.split("/").pop()?.replace(/^background-audio-\d+-/, "") || "Audio file"}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(settings.background_audio_url!, "_blank")}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Upload New Audio File</Label>
          <Input type="file" accept="audio/*" onChange={handleFileUpload} disabled={uploading} />
          {uploading && <Progress value={uploadProgress} className="w-full" />}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioManager;

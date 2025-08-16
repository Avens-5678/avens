"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function AudioManager() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      setSettings(data);
    };
    fetchSettings();
  }, [supabase]);

  // Upload new audio
  const handleUpload = async () => {
    if (!file) return;
    const fileName = `background_${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage.from("audio").upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(fileName);
    await supabase.from("site_settings").update({ background_audio_url: urlData.publicUrl }).eq("id", 1);

    toast({ title: "Success", description: "Audio uploaded." });
    setFile(null);
  };

  // Toggle background audio
  const toggleBackgroundAudio = async () => {
    const updated = !settings?.background_audio_enabled;
    await supabase.from("site_settings").update({ background_audio_enabled: updated }).eq("id", 1);
    setSettings({ ...settings, background_audio_enabled: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Audio Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Upload Audio File</Label>
            <Input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={handleUpload} className="mt-2">Upload</Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={settings?.background_audio_enabled || false}
              onCheckedChange={toggleBackgroundAudio}
            />
            <Label>Enable Background Audio</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

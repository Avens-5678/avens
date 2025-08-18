import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Volume2, Download, Play, Pause } from 'lucide-react';

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

const AudioManager = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    return () => { // Cleanup audio preview on unmount
        audioPreview?.pause();
    }
  }, []);

  const handleUpdate = async (updatedData: Partial<SiteSettings>) => {
    if (!settings) return;
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .update(updatedData)
        .eq('id', settings.id)
        .select()
        .single();
      if (error) throw error;
      setSettings(data); // Update local state for immediate UI feedback
      toast({ title: "Success", description: "Settings updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;
    setIsUploading(true);
    try {
      // Delete old file if it exists
      if (settings.background_audio_url) {
        const oldPath = settings.background_audio_url.split('/').pop();
        if(oldPath) await supabase.storage.from('audio').remove([oldPath]);
      }
      
      const fileName = `background-audio-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);
      await handleUpdate({ background_audio_url: publicUrl, background_audio_enabled: true });

    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!settings || !settings.background_audio_url) return;
    const oldPath = settings.background_audio_url.split('/').pop();
    if(oldPath) await supabase.storage.from('audio').remove([oldPath]);
    await handleUpdate({ background_audio_url: null, background_audio_enabled: false });
  };
  
  const handleInitialize = async () => {
    try {
        const { error } = await supabase.from('site_settings').insert({});
        if (error) throw error;
        await fetchSettings(); // Refetch to get the new settings row
    } catch (error: any) {
        toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
    }
  };

  const togglePreview = () => {
    if (!settings?.background_audio_url) return;
    if (audioPreview && !audioPreview.paused) {
        audioPreview.pause();
        return;
    }
    const audio = audioPreview || new Audio(settings.background_audio_url);
    if (!audioPreview) {
        setAudioPreview(audio);
        audio.onplay = () => setIsPreviewPlaying(true);
        audio.onpause = () => setIsPreviewPlaying(false);
        audio.onended = () => setIsPreviewPlaying(false);
    }
    audio.play();
  };

  if (isLoading) {
    return <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
  }

  if (!settings) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Background Audio Management</CardTitle>
                <CardDescription>Setup background audio for your website.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="mb-4">No settings record found. Please initialize one.</p>
                <Button onClick={handleInitialize}>Initialize Settings</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Audio Management</CardTitle>
        <CardDescription>Manage the background audio that plays on your website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label htmlFor="audio-enabled">Enable Background Audio</Label>
          <Switch 
            id="audio-enabled" 
            checked={settings.background_audio_enabled} 
            onCheckedChange={(checked) => handleUpdate({ background_audio_enabled: checked })}
          />
        </div>
        <div className="space-y-2">
            <Label>Audio File</Label>
            {settings.background_audio_url ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Volume2 className="h-4 w-4" />
                    <span className="flex-1 text-sm truncate">{settings.background_audio_url.split('/').pop()}</span>
                    <Button size="icon" variant="ghost" onClick={togglePreview}>{isPreviewPlaying ? <Pause size={16} /> : <Play size={16} />}</Button>
                    <Button size="icon" variant="ghost" asChild><a href={settings.background_audio_url} target="_blank"><Download size={16} /></a></Button>
                    <Button size="icon" variant="destructive" onClick={handleDelete}><Trash2 size={16} /></Button>
                </div>
            ) : <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">No audio file uploaded.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="audio-upload">Upload New File</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileUpload} disabled={isUploading} />
          {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioManager;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Play, Pause, Trash2, Volume2, Download } from 'lucide-react';

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
        audio.src = '';
      }
    };
  }, []);

  const fetchSettings = async () => {
    try {
      // FIX: Use .maybeSingle() to prevent errors on an empty table
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
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
    // FIX: Add a guard clause to ensure settings are loaded
    if (!settings) {
      toast({
        title: "Error",
        description: "Settings not loaded. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({ title: "Invalid File", description: "Please select an audio file.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Audio file must be smaller than 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (settings.background_audio_url) {
        const existingPath = settings.background_audio_url.split('/').pop();
        if (existingPath) {
          await supabase.storage.from('audio').remove([existingPath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `background-audio-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ background_audio_url: publicUrl, background_audio_enabled: true })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings(prev => prev ? { ...prev, background_audio_url: publicUrl, background_audio_enabled: true } : null);
      toast({ title: "Success", description: "Background audio uploaded successfully!" });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({ title: "Upload Failed", description: error.message || "Failed to upload audio file.", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    // FIX: Add a guard clause
    if (!settings) {
        toast({ title: "Error", description: "Settings not loaded.", variant: "destructive" });
        return;
    }

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ background_audio_enabled: enabled })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, background_audio_enabled: enabled } : null);
      toast({ title: "Updated", description: `Background audio ${enabled ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  };

  const handlePlayPause = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.addEventListener('error', () => {
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

  const handleDelete = async () => {
    // FIX: Add a guard clause
    if (!settings || !settings.background_audio_url) {
        toast({ title: "Error", description: "No audio file to delete or settings not loaded.", variant: "destructive" });
        return;
    }

    try {
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }

      const fileName = settings.background_audio_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('audio').remove([fileName]);
      }

      const { error } = await supabase
        .from('site_settings')
        .update({ background_audio_url: null, background_audio_enabled: false })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, background_audio_url: null, background_audio_enabled: false } : null);
      setAudio(null);
      toast({ title: "Deleted", description: "Background audio removed successfully." });

    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({ title: "Error", description: "Failed to delete audio file.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5" /> Background Audio Management</CardTitle></CardHeader>
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
      <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5" /> Background Audio Management</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="audio-enabled">Enable Background Audio</Label>
            <p className="text-sm text-muted-foreground">Toggle background audio for the website</p>
          </div>
          <Switch id="audio-enabled" checked={settings?.background_audio_enabled || false} onCheckedChange={handleToggleEnabled} />
        </div>
        {settings?.background_audio_url && (
          <div className="space-y-4">
            <div>
              <Label>Current Audio File</Label>
              <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-lg">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm">{settings.background_audio_url.split('/').pop()?.replace(/^background-audio-\d+-/, '') || 'Audio file'}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={handlePlayPause}>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(settings.background_audio_url!, '_blank')}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <Label>Upload New Audio File</Label>
          <div className="space-y-2">
            <Input type="file" accept="audio/*" onChange={handleFileUpload} disabled={uploading} />
            <p className="text-xs text-muted-foreground">Supported formats: MP3, WAV, OGG. Maximum size: 10MB</p>
          </div>
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Upload className="h-4 w-4 animate-pulse" /><span className="text-sm">Uploading...</span></div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">How it works:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Upload an audio file to set as the website's background music</li>
            <li>• Users will see floating audio controls on the website</li>
            <li>• The audio will loop automatically when enabled</li>
            <li>• Users can control playback and volume through the floating controls</li>
            <li>• Audio respects browser autoplay policies (users must interact first)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioManager;
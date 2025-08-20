import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false); // State to track auth readiness
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // FIX: Wait for Supabase to confirm auth state before fetching data
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // This listener fires once on initial load, confirming the session is checked.
        setIsAuthReady(true);
      }
    );

    return () => {
      // Cleanup the listener when the component unmounts
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load audio settings: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: This effect now depends on isAuthReady
  useEffect(() => {
    // Only fetch settings after the auth state has been confirmed
    if (isAuthReady) {
      fetchSettings();
    }
    return () => {
      audio?.pause();
    };
  }, [isAuthReady]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) {
      toast({ title: "Error", description: "Settings not loaded.", variant: "destructive" });
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);

      const { data: updatedSettings, error: updateError } = await supabase
        .from('site_settings')
        .update({ background_audio_url: publicUrl, background_audio_enabled: true })
        .eq('id', settings.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setSettings(updatedSettings);
      toast({ title: "Success", description: "Background audio uploaded." });

    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ background_audio_enabled: enabled })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      toast({ title: "Updated", description: `Audio ${enabled ? 'enabled' : 'disabled'}.` });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!settings || !settings.background_audio_url) return;
    try {
      const fileName = settings.background_audio_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('audio').remove([fileName]);
      }

      const { data, error } = await supabase
        .from('site_settings')
        .update({ background_audio_url: null, background_audio_enabled: false })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      audio?.pause();
      setAudio(null);
      toast({ title: "Deleted", description: "Audio file removed." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete audio.", variant: "destructive" });
    }
  };

  const handleInitialize = async () => {
    try {
      // First check if settings already exist
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('*')
        .maybeSingle();
      
      if (existingSettings) {
        setSettings(existingSettings);
        toast({
          title: "Success", 
          description: "Settings loaded successfully."
        });
        return;
      }

      // If no settings exist, create them
      const { data, error } = await supabase
        .from('site_settings')
        .insert({
          background_audio_enabled: true,
          background_audio_url: null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSettings(data);
      toast({
        title: "Success", 
        description: "Settings initialized successfully."
      });
    } catch (error: any) {
      console.error('Error initializing settings:', error);
      toast({ 
        title: "Error", 
        description: "Could not initialize settings: " + error.message, 
        variant: "destructive" 
      });
    }
  };

  const handlePlayPause = () => {
    if (!settings?.background_audio_url) return;
    if (audio && !audio.paused) {
      audio.pause();
      return;
    }
    const audioInstance = audio || new Audio(settings.background_audio_url);
    if (!audio) {
      setAudio(audioInstance);
      audioInstance.onplay = () => setIsPlaying(true);
      audioInstance.onpause = () => setIsPlaying(false);
      audioInstance.onended = () => setIsPlaying(false);
    }
    audioInstance.play();
  };

  // FIX: The loading state now waits for both auth and data fetching
  if (isLoading || !isAuthReady) {
    return (
      <Card>
        <CardHeader><CardTitle>Background Audio Management</CardTitle></CardHeader>
        <CardContent><div className="text-center p-8">Loading...</div></CardContent>
      </Card>
    );
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
        <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5" /> Background Audio Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="audio-enabled">Enable Background Audio</Label>
            <p className="text-sm text-muted-foreground">Toggle background audio for the website</p>
          </div>
          <Switch 
            id="audio-enabled" 
            checked={settings.background_audio_enabled} 
            onCheckedChange={handleToggleEnabled}
            disabled={isLoading}
          />
        </div>
        {settings.background_audio_url && (
          <div className="space-y-2">
            <Label>Current Audio File</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 text-sm truncate">{settings.background_audio_url.split('/').pop()}</span>
              <Button size="sm" variant="outline" onClick={handlePlayPause}>{isPlaying ? <Pause size={16}/> : <Play size={16}/>}</Button>
              <Button size="sm" variant="outline" asChild><a href={settings.background_audio_url} target="_blank" rel="noopener noreferrer"><Download size={16}/></a></Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}><Trash2 size={16}/></Button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="upload-input">Upload New Audio File</Label>
          <Input 
            id="upload-input"
            type="file" 
            accept="audio/*" 
            onChange={handleFileUpload} 
            disabled={isLoading || isUploading} 
          />
          {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioManager;

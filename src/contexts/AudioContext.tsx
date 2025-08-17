// src/contexts/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AudioSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

interface AudioContextType {
  settings: AudioSettings | null;
  isLoading: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
  toggleEnabled: (enabled: boolean) => void;
  uploadAudio: (file: File) => Promise<void>;
  deleteAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching audio settings:', error);
      toast({
        title: "Error",
        description: "Failed to load audio settings. Please ensure you're logged in as an admin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!settings?.background_audio_url) return;

    if (!audio) {
      const newAudio = new Audio(settings.background_audio_url);
      newAudio.loop = true;
      newAudio.addEventListener('ended', () => setIsPlaying(false));
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

  const toggleEnabled = async (enabled: boolean) => {
    if (!settings) return;
    try {
      const { data: updatedData, error } = await supabase
        .from('site_settings')
        .upsert({
          id: settings.id,
          background_audio_enabled: enabled,
          background_audio_url: settings.background_audio_url,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      setSettings(updatedData);
      toast({
        title: "Updated",
        description: `Background audio ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      console.error('Error updating enabled status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update audio settings.",
        variant: "destructive",
      });
    }
  };

  const uploadAudio = async (file: File) => {
    if (!settings) return;

    // Validate file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please select an audio file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete old file
      if (settings.background_audio_url) {
        const oldFileName = settings.background_audio_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('audio').remove([oldFileName]);
        }
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `background-audio-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName);

      // Update settings
      const { data: updatedData, error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          id: settings.id,
          background_audio_url: publicUrl,
          background_audio_enabled: true,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(updatedData);
      toast({ title: "Success", description: "Audio uploaded successfully!" });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload audio.",
        variant: "destructive",
      });
    }
  };

  const deleteAudio = async () => {
    if (!settings) return;

    try {
      if (audio && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }

      const fileName = settings.background_audio_url?.split('/').pop();
      if (fileName) {
        await supabase.storage.from('audio').remove([fileName]);
      }

      const { data: updatedData, error } = await supabase
        .from('site_settings')
        .upsert({
          id: settings.id,
          background_audio_url: null,
          background_audio_enabled: false,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      setSettings(updatedData);
      setAudio(null);

      toast({ title: "Deleted", description: "Audio removed successfully." });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete audio.",
        variant: "destructive",
      });
    }
  };

  return (
    <AudioContext.Provider value={{
      settings,
      isLoading,
      isPlaying,
      togglePlay,
      toggleEnabled,
      uploadAudio,
      deleteAudio,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

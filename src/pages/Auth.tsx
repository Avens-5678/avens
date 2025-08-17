import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, Pause, Trash2, Volume2, Download } from "lucide-react";

interface SiteSettings {
  id: string;
  background_audio_url: string | null;
  background_audio_enabled: boolean;
}

const AudioManager = () => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Check if logged-in user is super_admin
  const checkAdmin = async () => {
    if (!user) return false;

    const { data: adminData, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .eq("role", "super_admin")
      .eq("is_active", true)
      .maybeSingle();

    if (error || !adminData) return false;
    return true;
  };

  const fetchSettings = async () => {
    try {
      const isAdmin = await checkAdmin();
      if (!isAdmin) throw new Error("Access denied. You must be a super admin.");

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load audio settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [user, authLoading]);

  // … Include the same handleFileUpload, handleToggleEnabled, handlePlayPause, handleDelete functions 
  // from your previous AudioContext.tsx, just keep them as is, because RLS check is now in fetchSettings
  // and only super_admins will reach those functions.

  if (isLoading || authLoading) {
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

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Background Audio Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view or edit audio settings.
          </p>
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
        {/* Include your Switch, Upload, Play/Pause, Delete UI here as before */}
      </CardContent>
    </Card>
  );
};

export default AudioManager;

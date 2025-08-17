import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const AudioControls = () => {
  const { settings, isPlaying, togglePlay } = useAudio();

  if (!settings?.background_audio_enabled || !settings.background_audio_url) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 shadow-md rounded-xl p-3 flex items-center gap-2">
      <Volume2 className="h-5 w-5" />
      <Button size="sm" variant="outline" onClick={togglePlay}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default AudioControls;

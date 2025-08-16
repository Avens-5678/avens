import { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/contexts/AudioContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const AudioControls = () => {
  const { isPlaying, isMuted, volume, isLoaded, togglePlay, toggleMute, setVolume, initializeAudio } = useAudio();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleFirstInteraction = async () => {
    await initializeAudio();
    togglePlay();
  };

  // Show controls even if audio isn't loaded, but with different state
  if (!isLoaded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
        <Music className="h-4 w-4 text-muted-foreground" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled
        >
          <Play className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">Loading audio...</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
      <Music className="h-4 w-4 text-muted-foreground" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={isPlaying ? togglePlay : handleFirstInteraction}
        className="h-8 w-8 p-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <Popover open={showVolumeSlider} onOpenChange={setShowVolumeSlider}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className="h-8 w-8 p-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-32 p-2" 
          side="top"
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <div className="flex items-center gap-2">
            <VolumeX className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={([value]) => {
                setVolume(value / 100);
                if (value > 0 && isMuted) {
                  toggleMute();
                }
              }}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="h-3 w-3 text-muted-foreground" />
          </div>
        </PopoverContent>
      </Popover>

      {isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Playing</span>
        </div>
      )}
    </div>
  );
};

export default AudioControls;
import { useAudio } from "@/contexts/AudioContext";

const AudioControls = () => {
  const { settings, isPlaying, togglePlay, toggleEnabled, uploadAudio, deleteAudio } = useAudio();

  return (
    <div>
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <label>
        Enabled
        <input
          type="checkbox"
          checked={settings?.background_audio_enabled || false}
          onChange={e => toggleEnabled(e.target.checked)}
        />
      </label>
    </div>
  );
};

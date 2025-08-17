import { useAudio } from "@/contexts/AudioContext";

const AudioControls = () => {
  const { settings, isLoading, isPlaying, togglePlay } = useAudio();

  if (isLoading) return <p>Loading audio settings...</p>;
  if (!settings) return <p>No audio configured</p>;

  return (
    <div>
      <p>Current Audio: {settings.background_audio_url?.split("/").pop()}</p>
      <button onClick={togglePlay}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};

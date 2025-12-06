import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";

interface DemoAudioPlayerProps {
  audioContent: string;
  transcript: string;
  businessName: string;
  onReset: () => void;
}

const DemoAudioPlayer = ({
  audioContent,
  transcript,
  businessName,
  onReset,
}: DemoAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Auto-play when component mounts
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked, user will need to click play
      });
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={`data:audio/mpeg;base64,${audioContent}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Player Card */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium">Your AI Receptionist</h3>
            <p className="text-sm text-muted-foreground">{businessName}</p>
          </div>
        </div>

        {/* Waveform / Progress Bar */}
        <div className="mb-4">
          <div className="relative h-16 bg-muted/50 rounded-xl overflow-hidden">
            {/* Animated bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying ? "bg-primary" : "bg-primary/40"
                  }`}
                  style={{
                    height: `${20 + Math.sin(i * 0.5 + progress * 0.1) * 30}%`,
                    opacity: (i / 40) * 100 < progress ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            {/* Progress overlay */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/10"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Time */}
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={restart}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="hero"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onReset}
          >
            <RotateCcw className="w-5 h-5 scale-x-[-1]" />
          </Button>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          What your AI said:
        </h4>
        <p className="text-sm leading-relaxed whitespace-pre-line">{transcript}</p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <Link to="/signup" className="block">
          <Button variant="hero" size="lg" className="w-full h-14 text-base">
            Start Your Free Trial
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12"
          onClick={onReset}
        >
          Try Another Voice
        </Button>
      </div>

      {/* Social Proof */}
      <p className="text-center text-sm text-muted-foreground">
        Join 500+ businesses already using AI receptionists
      </p>
    </div>
  );
};

export default DemoAudioPlayer;
